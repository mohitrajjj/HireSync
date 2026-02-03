const express = require('express');
const router = express.Router();
const { getRecruiterAnalytics } = require('../controllers/analyticsController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

router.get('/recruiter', protect, recruiterOnly, getRecruiterAnalytics);

module.exports = router;
