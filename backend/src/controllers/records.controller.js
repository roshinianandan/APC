import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { AcademicRecord } from "../models/AcademicRecord.js";
import { ClusterRun } from "../models/ClusterRun.js";

// -----------------------------
// faculty/admin
// POST /api/records/upsert
// -----------------------------
export const upsertRecord = asyncHandler(async (req, res) => {
  const { studentId, department, term, attendancePct, cgpa, avgInternal, backlogs } = req.body;

  if (!studentId || !department || !term) {
    throw new AppError("studentId, department, term are required", 400);
  }

  const record = await AcademicRecord.findOneAndUpdate(
    // ✅ include department also (important)
    { studentId, department, term },
    {
      studentId,
      department,
      term,
      attendancePct: Number(attendancePct),
      cgpa: Number(cgpa),
      avgInternal: Number(avgInternal),
      backlogs: Number(backlogs)
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, record });
});

// -----------------------------
// faculty/admin
// GET /api/records?department=CSE&term=2025-SEM5
// -----------------------------
export const listRecords = asyncHandler(async (req, res) => {
  const { department, term } = req.query;
  if (!department || !term) throw new AppError("department and term required", 400);

  const records = await AcademicRecord.find({ department, term }).populate(
    "studentId",
    "name email role department"
  );

  res.json({ success: true, records });
});

// -----------------------------
// student
// GET /api/records/my?term=2025-SEM5&department=CSE
// -----------------------------
export const myRecord = asyncHandler(async (req, res) => {
  const term = String(req.query.term || "").trim();
  const department = String(req.query.department || req.user.department || "").trim();

  if (!term) throw new AppError("term required", 400);
  if (!department) throw new AppError("department required", 400);

  const record = await AcademicRecord.findOne({
    studentId: req.user._id,
    term,
    department
  });

  res.json({ success: true, record: record || null });
});

// -----------------------------
// student
// GET /api/records/my-cluster?term=2025-SEM5&department=CSE
// -----------------------------
export const myCluster = asyncHandler(async (req, res) => {
  const term = String(req.query.term || "").trim();
  const department = String(req.query.department || req.user.department || "").trim();

  if (!term) throw new AppError("term is required", 400);
  if (!department) throw new AppError("department is required", 400);

  const record = await AcademicRecord.findOne({
    studentId: req.user._id,
    term,
    department
  });

  if (!record) throw new AppError("No record found for your account in this term", 404);

  const run = await ClusterRun.findOne({ term, department }).sort({ createdAt: -1 });

  res.json({
    success: true,
    term,
    department,
    clusterLabel: record.clusterLabel,
    record: {
      attendancePct: record.attendancePct,
      cgpa: record.cgpa,
      avgInternal: record.avgInternal,
      backlogs: record.backlogs
    },
    runId: run ? run._id : null
  });
});

// -----------------------------
// faculty/admin
// DELETE /api/records/:id
// -----------------------------
export const deleteRecord = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const deleted = await AcademicRecord.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Record not found", 404);

  res.json({ success: true, message: "Record deleted" });
});
