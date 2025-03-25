import express from "express";
import {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  updateMissionProgress,
  getMissionStatistics,
} from "../controllers/missionController.js";

const router = express.Router();

router.get("/", getAllMissions);
router.get("/statistics", getMissionStatistics);
router.get("/:id", getMissionById);
router.post("/", createMission);
router.put("/:id", updateMission);
router.delete("/:id", deleteMission);
router.patch("/:id/progress", updateMissionProgress);

export default router;
