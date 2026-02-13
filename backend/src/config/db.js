import mongoose from "mongoose";

export async function connectDB() {
  const MONGO_URI = "mongodb://127.0.0.1:27017/academic_clustering";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (LOCAL):", MONGO_URI);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
