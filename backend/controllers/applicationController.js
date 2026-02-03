const Application = require("../models/Application");
const Job = require("../models/Job");

// Student applies to a job
const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = await Application.findOne({
      job: job._id,
      student: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    const resume = req.file ? req.file.path : req.body.resume;

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      resume,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applicants for a specific job (Recruiter)
// Supports optional query params: status, skill, name
const getApplicantsByJob = async (req, res) => {
  try {
    const { status, skill, name } = req.query;

    let applications = await Application.find({ job: req.params.jobId }).populate("student", "-password name email skills");

    // Filter by status
    if (status) {
      applications = applications.filter((a) => a.status === status);
    }

    // Filter by student skill
    if (skill) {
      applications = applications.filter((a) => a.student && Array.isArray(a.student.skills) && a.student.skills.includes(skill));
    }

    // Filter by student name (partial match)
    if (name) {
      const regex = new RegExp(name, "i");
      applications = applications.filter((a) => a.student && regex.test(a.student.name));
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (Recruiter)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current student's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("job")
      .populate("student", "name email");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyJob,
  getApplicantsByJob,
  updateApplicationStatus,
  getMyApplications,
};
