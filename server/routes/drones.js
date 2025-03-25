import express from "express";
import {
  getAllDrones,
  getDroneById,
  createDrone,
  updateDrone,
  deleteDrone,
  updateDroneStatus,
  updateDroneLocation,
  getDroneStatistics,
} from "../controllers/droneController.js";

const router = express.Router();

router.post("/", createDrone);
router.get("/statistics", getDroneStatistics);
router.patch("/:id/status", updateDroneStatus);
router.patch("/:id/location", updateDroneLocation);
router.get("/:id", getDroneById);
router.put("/:id", updateDrone);
router.delete("/:id", deleteDrone);
router.get("/", getAllDrones);

export default router;
