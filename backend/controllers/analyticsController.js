const Job = require('../models/Job');
const Application = require('../models/Application');

// GET /api/analytics/recruiter
const getRecruiterAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    const statusAgg = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const applicationsByStatus = statusAgg.map(s => ({ name: s._id, value: s.count }));

    // last 14 days time-series
    const since = new Date();
    since.setDate(since.getDate() - 13);

    const dateAgg = await Application.aggregate([
      { $match: { job: { $in: jobIds }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const applicationsOverTime = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = dateAgg.find(x => x._id === key);
      applicationsOverTime.push({ date: key, value: found ? found.count : 0 });
    }

    // skills distribution across applicants
    const applicants = await Application.find({ job: { $in: jobIds } }).populate('student', 'skills');
    const skillCounts = {};
    applicants.forEach(a => {
      const skills = (a.student && a.student.skills) || [];
      skills.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    const skillsDistribution = Object.keys(skillCounts).map(k => ({ skill: k, count: skillCounts[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ totalApplications, applicationsByStatus, applicationsOverTime, skillsDistribution });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecruiterAnalytics };
