import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mission",
    required: true,
  },
  generatedAt: { type: Date, default: Date.now },
  summary: { type: String, required: true },
  flightStats: {
    duration: Number, // in minutes
    distance: Number, // in meters
    coverage: Number, // in square meters
  },
  analysis: { type: Object }, // AI analysis results
});

export default mongoose.model("Report", reportSchema);
