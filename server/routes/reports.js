import express from "express";
import {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/generate", generateReport);
router.get("/", getAllReports);
router.get("/:id", getReportById);
router.delete("/:id", deleteReport);

export default router;
