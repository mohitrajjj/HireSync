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
    const resumeSize = req.file ? req.file.size : undefined;

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      resume,
      resumeSize,
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
    const { status, excludeStatus, skill, name, page = 1, limit = 10, sort = "newest" } = req.query;

    // Debug logging to aid troubleshooting
    console.log(`GET APPLICANTS: requester=${req.user?._id} role=${req.user?.role} jobId=${req.params.jobId} status=${status} excludeStatus=${excludeStatus}`);

    let applications = await Application.find({ job: req.params.jobId }).populate("student", "name email skills");

    console.log(`Found ${applications.length} total applications for job ${req.params.jobId}`);

    // Filter by status (inclusive)
    if (status) {
      applications = applications.filter((a) => a.status === status);
    }

    // Filter by excludeStatus (exclusive)
    if (excludeStatus) {
      applications = applications.filter((a) => a.status !== excludeStatus);
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

    // Sort by createdAt
    applications.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });

    // Paginate
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const total = applications.length;
    const start = (pageNum - 1) * limitNum;
    const items = applications.slice(start, start + limitNum);

    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('GET APPLICANTS ERROR:', error);
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

// Update application fields (Recruiter)
const updateApplicationFields = async (req, res) => {
  try {
    const { notes, interviewLink } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (typeof notes === "string") application.notes = notes;
    if (typeof interviewLink === "string") application.interviewLink = interviewLink;

    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk update application status (Recruiter)
const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No applications selected" });
    }

    if (!['accepted', 'rejected', 'applied'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await Application.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.json({ updated: result.modifiedCount || 0 });
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
  updateApplicationFields,
  bulkUpdateApplicationStatus,
  getMyApplications,
};
