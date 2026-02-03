const express = require("express");
const { applyJob, getApplicantsByJob, updateApplicationStatus, updateApplicationFields, bulkUpdateApplicationStatus, getMyApplications } = require("../controllers/applicationController");
const { protect, recruiterOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Accept resume upload (multipart/form-data)
router.post("/:jobId", protect, upload.single("resume"), applyJob);
router.get("/job/:jobId", protect, recruiterOnly, getApplicantsByJob);

// Bulk update status
router.put("/bulk-status", protect, recruiterOnly, bulkUpdateApplicationStatus);

// Get current student's applications
router.get("/me", protect, getMyApplications);

router.put("/:id/status", protect, recruiterOnly, updateApplicationStatus);
router.patch("/:id", protect, recruiterOnly, updateApplicationFields);

module.exports = router;
