import mongoose from "mongoose";

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String, required: true },
    term: { type: String, required: true },

    attendancePct: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    avgInternal: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },

    // ✅ clustering outputs
    clusterLabel: { type: Number, default: null },
    clusterRunId: { type: mongoose.Schema.Types.ObjectId, ref: "ClusterRun", default: null }
  },
  { timestamps: true }
);

academicRecordSchema.index({ studentId: 1, term: 1 }, { unique: true });
academicRecordSchema.index({ department: 1, term: 1 });
academicRecordSchema.index({ clusterRunId: 1 }); // optional but useful

export const AcademicRecord = mongoose.model("AcademicRecord", academicRecordSchema);
