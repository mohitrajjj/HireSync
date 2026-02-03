import express from "express";
import {
  applyJob,
  getApplicantsByJob,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect, recruiterOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId", protect, applyJob);
router.get("/job/:jobId", protect, recruiterOnly, getApplicantsByJob);

// ✅ NEW
router.put("/:id/status", protect, recruiterOnly, updateApplicationStatus);

export default router;
