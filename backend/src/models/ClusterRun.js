import mongoose from "mongoose";

const ClusterRunSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    term: { type: String, required: true },
    k: { type: Number, required: true },

    features: [{ type: String, required: true }],

    centroids: { type: [[Number]], default: [] },

    // ✅ cluster summary
    stats: {
      type: Object,
      default: {}
    },

    // ✅ store assignments: studentId + clusterLabel
    assignments: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        clusterLabel: { type: Number }
      }
    ],

    totalRecords: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export const ClusterRun = mongoose.model("ClusterRun", ClusterRunSchema);
