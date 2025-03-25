import Mission from "../models/Mission.js";
import Drone from "../models/Drone.js";
import { optimizeSurveyPath } from "../services/aiService.js";

export const getAllMissions = async (req, res) => {
  try {
    const missions = await Mission.find().populate("assignedDrone");
    res.status(200).json(missions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch missions", error: error.message });
  }
};

export const getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id).populate(
      "assignedDrone"
    );
    if (!mission) return res.status(404).json({ message: "Mission not found" });
    res.status(200).json(mission);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch mission", error: error.message });
  }
};

export const createMission = async (req, res) => {
  try {
    const { name, surveyArea, parameters, schedule, assignedDrone } = req.body;
    console.log(req.body);

    // Validation
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Name is required and must be a string" });
    }
    if (
      !surveyArea ||
      !Array.isArray(surveyArea.coordinates) ||
      !Array.isArray(surveyArea.coordinates[0])
    ) {
      return res.status(400).json({
        message:
          "Survey area must have coordinates in [[[lon, lat], ...]] format",
      });
    }
    if (
      !parameters ||
      !parameters.altitude ||
      !parameters.speed ||
      !parameters.overlap ||
      !parameters.pattern
    ) {
      return res.status(400).json({
        message:
          "All parameters (altitude, speed, overlap, pattern) are required",
      });
    }
    if (typeof parameters.altitude !== "number" || parameters.altitude <= 0) {
      return res
        .status(400)
        .json({ message: "Altitude must be a positive number" });
    }
    if (typeof parameters.speed !== "number" || parameters.speed <= 0) {
      return res
        .status(400)
        .json({ message: "Speed must be a positive number" });
    }
    if (
      typeof parameters.overlap !== "number" ||
      parameters.overlap < 0 ||
      parameters.overlap > 100
    ) {
      return res
        .status(400)
        .json({ message: "Overlap must be between 0 and 100" });
    }
    if (!["crosshatch", "parallel", "perimeter"].includes(parameters.pattern)) {
      return res.status(400).json({ message: "Invalid pattern value" });
    }
    if (!schedule || !schedule.startTime) {
      return res
        .status(400)
        .json({ message: "Schedule with startTime is required" });
    }

    if (assignedDrone) {
      const drone = await Drone.findById(assignedDrone);
      if (!drone || drone.status !== "available") {
        return res.status(400).json({ message: "Drone unavailable" });
      }
      drone.status = "in-mission";
      await drone.save();
    }

    const optimizedPath = await optimizeSurveyPath(surveyArea, parameters);
    // Ensure optimizedPath.coordinates is in [[[lon, lat], ...]] format
    let finalCoordinates;
    if (
      Array.isArray(optimizedPath.coordinates) &&
      Array.isArray(optimizedPath.coordinates[0]) &&
      Array.isArray(optimizedPath.coordinates[0][0])
    ) {
      finalCoordinates = optimizedPath.coordinates; // Already in [[[lon, lat], ...]] format
    } else if (
      Array.isArray(optimizedPath.coordinates) &&
      Array.isArray(optimizedPath.coordinates[0])
    ) {
      finalCoordinates = [optimizedPath.coordinates]; // Wrap in an array to match [[[lon, lat], ...]]
    } else {
      finalCoordinates = surveyArea.coordinates; // Fallback to original coordinates
    }

    const distance = calculateDistance(finalCoordinates);
    const eta = distance / parameters.speed / 60;

    const mission = new Mission({
      name,
      surveyArea: { type: "Polygon", coordinates: finalCoordinates },
      parameters,
      schedule,
      assignedDrone,
      eta,
    });

    const newMission = await mission.save();
    if (assignedDrone) {
      await Drone.findByIdAndUpdate(assignedDrone, {
        lastMission: newMission._id,
      });
    }

    scheduleMission(newMission);
    res.status(201).json(newMission);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create mission", error: error.message });
  }
};

export const updateMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: "Mission not found" });

    const { name, surveyArea, parameters, schedule, assignedDrone, progress } =
      req.body;

    // Validation
    if (name && typeof name !== "string") {
      return res.status(400).json({ message: "Name must be a string" });
    }
    if (surveyArea && !Array.isArray(surveyArea.coordinates)) {
      return res
        .status(400)
        .json({ message: "Survey area must have coordinates" });
    }
    if (parameters) {
      if (
        parameters.altitude &&
        (typeof parameters.altitude !== "number" || parameters.altitude <= 0)
      ) {
        return res
          .status(400)
          .json({ message: "Altitude must be a positive number" });
      }
      if (
        parameters.speed &&
        (typeof parameters.speed !== "number" || parameters.speed <= 0)
      ) {
        return res
          .status(400)
          .json({ message: "Speed must be a positive number" });
      }
      if (
        parameters.overlap &&
        (typeof parameters.overlap !== "number" ||
          parameters.overlap < 0 ||
          parameters.overlap > 100)
      ) {
        return res
          .status(400)
          .json({ message: "Overlap must be between 0 and 100" });
      }
      if (
        parameters.pattern &&
        !["crosshatch", "parallel", "perimeter"].includes(parameters.pattern)
      ) {
        return res.status(400).json({ message: "Invalid pattern value" });
      }
    }
    if (
      schedule &&
      schedule.startTime &&
      isNaN(new Date(schedule.startTime).getTime())
    ) {
      return res.status(400).json({ message: "Invalid startTime" });
    }
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
    }

    // Update only provided fields
    if (name) mission.name = name;
    if (surveyArea)
      mission.surveyArea = {
        type: "Polygon",
        coordinates: surveyArea.coordinates,
      };
    if (parameters)
      mission.parameters = { ...mission.parameters, ...parameters };
    if (schedule) mission.schedule = { ...mission.schedule, ...schedule };
    if (assignedDrone) {
      const drone = await Drone.findById(assignedDrone);
      if (!drone || drone.status !== "available") {
        return res.status(400).json({ message: "Drone unavailable" });
      }
      mission.assignedDrone = assignedDrone;
      await Drone.findByIdAndUpdate(assignedDrone, { status: "in-mission" });
    }
    if (progress !== undefined) mission.progress = progress;
    mission.updatedAt = Date.now();

    const updatedMission = await mission.save();
    res.status(200).json(updatedMission);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update mission", error: error.message });
  }
};

export const deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: "Mission not found" });
    if (mission.assignedDrone) {
      await Drone.findByIdAndUpdate(mission.assignedDrone, {
        status: "available",
      });
    }
    await mission.deleteOne();
    res.status(200).json({ message: "Mission deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete mission", error: error.message });
  }
};

export const updateMissionProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const mission = await Mission.findById(req.params.id).populate(
      "assignedDrone"
    );
    if (!mission) return res.status(404).json({ message: "Mission not found" });

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ message: "Progress must be a number between 0 and 100" });
    }

    mission.progress = progress;
    mission.updatedAt = Date.now();
    if (progress === 100) {
      mission.status = "completed";
      if (mission.assignedDrone) {
        await Drone.findByIdAndUpdate(mission.assignedDrone, {
          status: "available",
        });
      }
    } else if (progress > 0 && mission.status === "planned") {
      mission.status = "in-progress";
    }
    mission.eta = ((100 - progress) / 100) * mission.eta;
    const updatedMission = await mission.save();
    res.status(200).json(updatedMission);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update mission progress",
      error: error.message,
    });
  }
};

export const getMissionStatistics = async (req, res) => {
  try {
    const stats = await Mission.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgProgress: { $avg: "$progress" },
          avgETA: { $avg: "$eta" },
        },
      },
    ]);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mission statistics",
      error: error.message,
    });
  }
};

// Helper: Calculate distance (simplified, assumes flat path)
const calculateDistance = (coordinates) => {
  let distance = 0;
  for (let i = 0; i < coordinates[0].length - 1; i++) {
    const [lon1, lat1] = coordinates[0][i];
    const [lon2, lat2] = coordinates[0][i + 1];
    distance += Math.sqrt((lon2 - lon1) ** 2 + (lat2 - lat1) ** 2) * 111000; // Rough meters
  }
  return distance;
};

// Schedule recurring missions
const scheduleMission = (mission) => {
  if (mission.schedule.isRecurring) {
    const interval = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    }[mission.schedule.frequency];
    setInterval(async () => {
      if (mission.status === "completed") {
        const newMission = new Mission({
          ...mission.toObject(),
          _id: undefined,
          progress: 0,
          status: "planned",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await newMission.save();
      }
    }, interval);
  }
};
