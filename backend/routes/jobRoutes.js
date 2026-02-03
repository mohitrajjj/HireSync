const express = require("express");
const router = express.Router();

const Job = require("../models/Job");
const { protect, recruiterOnly } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/jobs
 * @desc    Recruiter creates a job
 * @access  Private (Recruiter)
 */
router.post("/", protect, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.create({
      title: req.body.title,
      description: req.body.description,
      companyName: req.body.companyName,
      location: req.body.location,
      jobType: req.body.jobType || "Full-Time",
      skillsRequired: req.body.skillsRequired,
      recruiter: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs (Student)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/**
 * @route   GET /api/jobs/my
 * @desc    Get logged-in recruiter's jobs
 * @access  Private (Recruiter)
 */
router.get("/my", protect, recruiterOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(jobs);
  } catch (err) {
    console.error("GET MY JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch recruiter jobs" });
  }
});

module.exports = router;
