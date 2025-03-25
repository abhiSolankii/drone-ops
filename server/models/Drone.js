import mongoose from "mongoose";

const droneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["available", "in-mission", "maintenance", "charging"],
    default: "available",
  },
  batteryLevel: { type: Number, min: 0, max: 100, default: 100 },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      validate: {
        validator: function (coords) {
          return (
            coords.length === 2 &&
            coords[0] >= -90 &&
            coords[0] <= 90 && // Latitude range
            coords[1] >= -180 &&
            coords[1] <= 180 // Longitude range
          );
        },
        message:
          "Invalid coordinates. Latitude must be -90 to 90, and Longitude must be -180 to 180.",
      },
      default: [0, 0],
    },
  },
  specifications: {
    maxFlightTime: Number,
    maxSpeed: Number,
    maxAltitude: Number,
    sensors: [String],
  },
  maintenanceHistory: [
    {
      date: { type: Date, default: Date.now },
      type: String,
      description: String,
    },
  ],
  lastMission: { type: mongoose.Schema.Types.ObjectId, ref: "Mission" },
  lastSeen: { type: Date, default: Date.now },
});

droneSchema.index({ location: "2dsphere" });

export default mongoose.model("Drone", droneSchema);
