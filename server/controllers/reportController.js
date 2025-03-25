import Mission from "../models/Mission.js";
import Report from "../models/Report.js";
import mongoose from "mongoose";
import { generateSurveyReport, analyzeImage } from "../services/aiService.js";

export const generateReport = async (req, res) => {
  try {
    const { missionId, images } = req.body;

    // Validation
    if (!missionId || !mongoose.Types.ObjectId.isValid(missionId)) {
      return res.status(400).json({ message: "Valid missionId is required" });
    }
    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ message: "Images array is required and must not be empty" });
    }

    const mission = await Mission.findById(missionId).populate("assignedDrone");
    if (!mission) return res.status(404).json({ message: "Mission not found" });

    const analysisResults = await Promise.all(
      images.map((image) => analyzeImage(image))
    );
    const reportContent = await generateSurveyReport(mission, analysisResults);

    const report = new Report({
      missionId,
      summary: reportContent.summary,
      flightStats: {
        duration: (mission.updatedAt - mission.createdAt) / 60000, // minutes
        distance: calculateDistance(mission.surveyArea.coordinates),
        coverage: calculateCoverage(mission.surveyArea.coordinates),
      },
      analysis: analysisResults,
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to generate report", error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("missionId");
    res.status(200).json(reports);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch reports", error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("missionId");
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch report", error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    await report.deleteOne();
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete report", error: error.message });
  }
};

// Helpers
const calculateDistance = (coordinates) => {
  let distance = 0;
  for (let i = 0; i < coordinates[0].length - 1; i++) {
    const [lon1, lat1] = coordinates[0][i];
    const [lon2, lat2] = coordinates[0][i + 1];
    distance += Math.sqrt((lon2 - lon1) ** 2 + (lat2 - lat1) ** 2) * 111000;
  }
  return distance;
};

const calculateCoverage = (coordinates) => {
  const minLon = Math.min(...coordinates[0].map((c) => c[0]));
  const maxLon = Math.max(...coordinates[0].map((c) => c[0]));
  const minLat = Math.min(...coordinates[0].map((c) => c[1]));
  const maxLat = Math.max(...coordinates[0].map((c) => c[1]));
  return (maxLon - minLon) * (maxLat - minLat) * 111000 * 111000; // Rough sq meters
};
