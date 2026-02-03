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
      salaryMin: req.body.salaryMin,
      salaryMax: req.body.salaryMax,
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
    const { search, skill, location, jobType, minSalary, maxSalary, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }, { companyName: regex }];
    }

    if (location) {
      query.location = new RegExp(location, "i");
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (skill) {
      query.skillsRequired = { $in: [skill] };
    }

    if (minSalary || maxSalary) {
      query.$and = query.$and || [];
      if (minSalary) {
        query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
      }
      if (maxSalary) {
        query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ items: jobs, total, page: Number(page), limit: Number(limit) });
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
