import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ["planned", "in-progress", "completed", "aborted"],
    default: "in-progress",
  },
  surveyArea: {
    type: { type: String, enum: ["Polygon"], required: true },
    coordinates: { type: [[[Number]]], required: true },
  },
  parameters: {
    altitude: { type: Number, required: true },
    speed: { type: Number, required: true },
    overlap: { type: Number, min: 0, max: 100, required: true },
    pattern: {
      type: String,
      enum: ["crosshatch", "parallel", "perimeter"],
      required: true,
    },
  },
  assignedDrone: { type: mongoose.Schema.Types.ObjectId, ref: "Drone" },
  schedule: {
    startTime: { type: Date, required: true },
    endTime: Date,
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  eta: { type: Number }, // Estimated time remaining in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

missionSchema.index({ surveyArea: "2dsphere" });

export default mongoose.model("Mission", missionSchema);
