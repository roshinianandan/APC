import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import { StudentProfile } from "../models/StudentProfile.js";
import { AcademicRecord } from "../models/AcademicRecord.js";
import { ClusterRun } from "../models/ClusterRun.js";

// -------------------------
// PROFILE APIs
// -------------------------

// GET /api/students/me
export const myProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  res.json({ success: true, profile: profile || null });
});

// POST /api/students/profile
export const upsertProfile = asyncHandler(async (req, res) => {
  const { registerNo, year, section, department } = req.body;

  if (!registerNo || !year || !section || !department) {
    throw new AppError("registerNo, year, section, department are required", 400);
  }

  const updated = await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      registerNo,
      year: Number(year),
      section,
      department
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, profile: updated });
});

// -------------------------
// SUGGESTIONS API
// -------------------------

function clusterNameFromCentroid(centroid) {
  // centroid = [attendancePct, cgpa, avgInternal, backlogs]
  const att = Number(centroid && centroid[0] ? centroid[0] : 0);
  const cgpa = Number(centroid && centroid[1] ? centroid[1] : 0);
  const internal = Number(centroid && centroid[2] ? centroid[2] : 0);
  const backlogs = Number(centroid && centroid[3] ? centroid[3] : 0);

  // simple rules to label clusters (demo-friendly)
  if (cgpa >= 8 && backlogs === 0 && att >= 80) return "High Performer";
  if (backlogs >= 1 || att < 65) return "At Risk";
  if (internal < 55) return "Needs Internal Improvement";
  return "Average / Stable";
}

function buildSuggestions(record, clusterTitle) {
  const suggestions = [];

  const att = Number(record.attendancePct || 0);
  const cgpa = Number(record.cgpa || 0);
  const internal = Number(record.avgInternal || 0);
  const backlogs = Number(record.backlogs || 0);

  suggestions.push({
    title: "Your cluster category",
    detail: "You belong to: " + clusterTitle + ". Suggestions below are based on your current academic record."
  });

  // attendance
  if (att < 65) {
    suggestions.push({
      title: "Improve attendance urgently",
      detail:
        "Your attendance is low (" +
        att +
        "%). Target 75%+ by attending all important classes/labs and tracking missed hours weekly."
    });
  } else if (att < 75) {
    suggestions.push({
      title: "Raise attendance to safe zone",
      detail: "Your attendance is " + att + "%. Aim for 80%+ to avoid shortage issues."
    });
  } else {
    suggestions.push({
      title: "Keep attendance consistent",
      detail: "Good attendance (" + att + "%). Maintain the routine and avoid last-minute shortages."
    });
  }

  // cgpa
  if (cgpa < 6.5) {
    suggestions.push({
      title: "Boost CGPA with a plan",
      detail:
        "Your CGPA is " +
        cgpa +
        ". Focus on high-weight units, solve previous papers, and revise weekly with short notes."
    });
  } else if (cgpa < 8) {
    suggestions.push({
      title: "Push CGPA to 8+",
      detail:
        "Your CGPA is " +
        cgpa +
        ". Improve by practicing numericals/derivations and maintaining a revision timetable."
    });
  } else {
    suggestions.push({
      title: "Maintain high CGPA",
      detail: "Great CGPA (" + cgpa + "). Continue consistent revision and practice."
    });
  }

  // internal
  if (internal < 55) {
    suggestions.push({
      title: "Improve internal marks",
      detail:
        "Your internal average is " +
        internal +
        ". Submit assignments early, attend internal tests seriously, and ask faculty for feedback."
    });
  } else if (internal < 70) {
    suggestions.push({
      title: "Strengthen internal performance",
      detail: "Your internal average is " + internal + ". Improve using weekly unit-wise practice and quizzes."
    });
  } else {
    suggestions.push({
      title: "Good internal performance",
      detail: "Internal average is strong (" + internal + "). Keep doing regular practice and timely submissions."
    });
  }

  // backlogs
  if (backlogs > 0) {
    suggestions.push({
      title: "Clear backlogs with priority",
      detail:
        "You have " +
        backlogs +
        " backlog(s). Make a 2-week plan per subject: basics → notes → previous papers → test."
    });
  } else {
    suggestions.push({
      title: "Stay backlog-free",
      detail: "No backlogs. Maintain your revision schedule to keep it that way."
    });
  }

  suggestions.push({
    title: "Weekly action plan (simple)",
    detail: "Mon–Fri: 1 hr revision + 30 min problems. Sat: mock test. Sun: fix weak topics + plan next week."
  });

  return suggestions;
}

// GET /api/students/suggestions?department=CSE&term=2025-SEM5
export const mySuggestions = asyncHandler(async (req, res) => {
  const department = String(req.query.department || "").trim();
  const term = String(req.query.term || "").trim();

  if (!term) throw new AppError("term is required", 400);

  // if department not provided, try user department, else use profile
  let dept = department;
  if (!dept) {
    dept = req.user.department || "";
    if (!dept) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      dept = profile && profile.department ? profile.department : "";
    }
  }

  if (!dept) throw new AppError("department is required", 400);

  const record = await AcademicRecord.findOne({
    studentId: req.user._id,
    department: dept,
    term: term
  });

  if (!record) throw new AppError("No academic record found for your account in this term", 404);

  // latest cluster run (for centroids)
  const run = await ClusterRun.findOne({ department: dept, term: term }).sort({ createdAt: -1 });

  let clusterTitle = "Cluster " + String(record.clusterLabel ?? "-");
  let centroid = null;

  if (run && Array.isArray(run.centroids) && record.clusterLabel !== undefined && record.clusterLabel !== null) {
    centroid = run.centroids[Number(record.clusterLabel)] || null;
    if (centroid) clusterTitle = clusterNameFromCentroid(centroid);
  }

  const suggestions = buildSuggestions(record, clusterTitle);

  res.json({
    success: true,
    department: dept,
    term: term,
    clusterLabel: record.clusterLabel,
    clusterTitle: clusterTitle,
    centroid: centroid,
    record: {
      attendancePct: record.attendancePct,
      cgpa: record.cgpa,
      avgInternal: record.avgInternal,
      backlogs: record.backlogs
    },
    suggestions: suggestions
  });
});
