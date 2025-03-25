import Drone from "../models/Drone.js";

export const getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find().populate("lastMission");
    res.status(200).json(drones);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drones", error: error.message });
  }
};

export const getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id).populate("lastMission");
    if (!drone) return res.status(404).json({ message: "Drone not found" });
    res.status(200).json(drone);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drone", error: error.message });
  }
};

export const createDrone = async (req, res) => {
  try {
    const {
      name,
      serialNumber,
      status,
      batteryLevel,
      location,
      specifications,
    } = req.body;

    // Validation
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Name is required and must be a string" });
    }
    if (!serialNumber || typeof serialNumber !== "string") {
      return res
        .status(400)
        .json({ message: "Serial number is required and must be a string" });
    }
    if (
      status &&
      !["available", "in-mission", "maintenance", "charging"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (
      batteryLevel !== undefined &&
      (batteryLevel < 0 || batteryLevel > 100)
    ) {
      return res
        .status(400)
        .json({ message: "Battery level must be between 0 and 100" });
    }
    if (
      location &&
      (!Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2)
    ) {
      return res.status(400).json({
        message:
          "Location coordinates must be an array of [longitude, latitude]",
      });
    }

    const existingDrone = await Drone.findOne({ serialNumber });
    if (existingDrone) {
      return res.status(400).json({ message: "Drone already exists" });
    }

    const drone = new Drone({
      name,
      serialNumber,
      status: status || "available",
      batteryLevel: batteryLevel || 100,
      location: location || { type: "Point", coordinates: [0, 0] },
      specifications: specifications || {},
    });

    const newDrone = await drone.save();
    res.status(201).json(newDrone);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create drone", error: error.message });
  }
};

export const updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });

    const {
      name,
      serialNumber,
      status,
      batteryLevel,
      location,
      specifications,
    } = req.body;

    // Validation
    if (name && typeof name !== "string") {
      return res.status(400).json({ message: "Name must be a string" });
    }
    if (serialNumber && typeof serialNumber !== "string") {
      return res
        .status(400)
        .json({ message: "Serial number must be a string" });
    }
    if (
      status &&
      !["available", "in-mission", "maintenance", "charging"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (
      batteryLevel !== undefined &&
      (batteryLevel < 0 || batteryLevel > 100)
    ) {
      return res
        .status(400)
        .json({ message: "Battery level must be between 0 and 100" });
    }
    if (
      location &&
      (!Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2)
    ) {
      return res.status(400).json({
        message:
          "Location coordinates must be an array of [longitude, latitude]",
      });
    }

    // Update only provided fields
    if (name) drone.name = name;
    if (serialNumber) drone.serialNumber = serialNumber;
    if (status) drone.status = status;
    if (batteryLevel !== undefined) drone.batteryLevel = batteryLevel;
    if (location)
      drone.location = { type: "Point", coordinates: location.coordinates };
    if (specifications) drone.specifications = specifications;
    drone.lastSeen = Date.now();

    const updatedDrone = await drone.save();
    res.status(200).json(updatedDrone);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update drone", error: error.message });
  }
};

export const deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });
    await drone.deleteOne();
    res.status(200).json({ message: "Drone deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete drone", error: error.message });
  }
};

export const updateDroneStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });

    if (
      !status ||
      !["available", "in-mission", "maintenance", "charging"].includes(status)
    ) {
      return res
        .status(400)
        .json({ message: "Status is required and must be a valid value" });
    }

    drone.status = status;
    drone.lastSeen = Date.now();
    const updatedDrone = await drone.save();
    res.status(200).json(updatedDrone);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update drone status", error: error.message });
  }
};

export const updateDroneLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        message: "Coordinates must be an array of [longitude, latitude]",
      });
    }

    drone.location.coordinates = coordinates;
    drone.lastSeen = Date.now();
    const updatedDrone = await drone.save();
    res.status(200).json(updatedDrone);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update drone location",
      error: error.message,
    });
  }
};

export const getDroneStatistics = async (req, res) => {
  try {
    const stats = await Drone.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgBattery: { $avg: "$batteryLevel" },
          recentUpdates: { $max: "$lastSeen" },
        },
      },
    ]);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch drone statistics",
      error: error.message,
    });
  }
};
