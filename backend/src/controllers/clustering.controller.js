import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import { AcademicRecord } from "../models/AcademicRecord.js";
import { ClusterRun } from "../models/ClusterRun.js";

import { runKMeans } from "../services/clustering.service.js";

function buildStats(records, labels, k) {
  const clusters = Array.from({ length: k }, function () {
    return {
      count: 0,
      avgAttendance: 0,
      avgCgpa: 0,
      avgInternal: 0,
      avgBacklogs: 0
    };
  });

  for (let i = 0; i < records.length; i++) {
    const c = labels[i];
    clusters[c].count += 1;
    clusters[c].avgAttendance += Number(records[i].attendancePct || 0);
    clusters[c].avgCgpa += Number(records[i].cgpa || 0);
    clusters[c].avgInternal += Number(records[i].avgInternal || 0);
    clusters[c].avgBacklogs += Number(records[i].backlogs || 0);
  }

  for (let c = 0; c < k; c++) {
    if (clusters[c].count > 0) {
      clusters[c].avgAttendance = Number((clusters[c].avgAttendance / clusters[c].count).toFixed(2));
      clusters[c].avgCgpa = Number((clusters[c].avgCgpa / clusters[c].count).toFixed(2));
      clusters[c].avgInternal = Number((clusters[c].avgInternal / clusters[c].count).toFixed(2));
      clusters[c].avgBacklogs = Number((clusters[c].avgBacklogs / clusters[c].count).toFixed(2));
    }
  }

  return { clusters };
}

// POST /api/clustering/run
export const runClustering = asyncHandler(async (req, res) => {
  const department = String(req.body.department || "").trim();
  const term = String(req.body.term || "").trim();
  const k = Number(req.body.k);

  if (!department || !term) throw new AppError("department and term are required", 400);
  if (!Number.isFinite(k) || k <= 1) throw new AppError("k must be a number > 1", 400);

  const records = await AcademicRecord.find({ department, term }).populate(
    "studentId",
    "name email role department"
  );

  if (!records.length) throw new AppError("No records found for department/term", 400);
  if (records.length < k) throw new AppError("k cannot be greater than number of records", 400);

  const X = records.map(function (r) {
    return [
      Number(r.attendancePct || 0),
      Number(r.cgpa || 0),
      Number(r.avgInternal || 0),
      Number(r.backlogs || 0)
    ];
  });

  const result = runKMeans(X, k);
  const labels = result.labels;
  const centroids = result.centroids;

  // ✅ store ObjectId reference for populate (VERY IMPORTANT)
  const assignments = records.map(function (r, i) {
    return {
      studentId: r.studentId && r.studentId._id ? r.studentId._id : r.studentId, // ObjectId
      clusterLabel: Number(labels[i])
    };
  });

  const stats = buildStats(records, labels, k);

  const run = await ClusterRun.create({
    department,
    term,
    k,
    features: ["attendancePct", "cgpa", "avgInternal", "backlogs"],
    centroids,
    assignments,
    stats,
    createdBy: req.user ? req.user._id : null,
    totalRecords: records.length
  });

  // ✅ save clusterLabel into AcademicRecord
  const bulk = records.map(function (r, i) {
    return {
      updateOne: {
        filter: { _id: r._id },
        update: { $set: { clusterLabel: Number(labels[i]), clusterRunId: run._id } }
      }
    };
  });

  await AcademicRecord.bulkWrite(bulk);

  res.json({
    success: true,
    message: "Clustering completed",
    runId: run._id,
    total: records.length
  });
});

// GET /api/clustering/latest?department=CSE&term=2025-SEM5
export const latestRun = asyncHandler(async (req, res) => {
  const department = String(req.query.department || "").trim();
  const term = String(req.query.term || "").trim();
  if (!department || !term) throw new AppError("department and term are required", 400);

  const run = await ClusterRun.findOne({ department, term })
    .sort({ createdAt: -1 })
    .populate("assignments.studentId", "name email");

  res.json({ success: true, run: run || null });
});
