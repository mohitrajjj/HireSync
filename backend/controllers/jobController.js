import Job from "../models/Job.js";

// @desc    Create a new job (Recruiter only)
// @route   POST /api/jobs
// @access  Private (Recruiter)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      skillsRequired,
      location,
      jobType,
      companyName,
    } = req.body;

    if (!title || !description || !companyName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const job = await Job.create({
      title,
      description,
      skillsRequired,
      location,
      jobType,
      companyName,
      recruiter: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs (Public)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
