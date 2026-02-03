const express = require("express");
const router = express.Router();
const { getMyProfile, updateMyProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("resume"), updateMyProfile);

module.exports = router;
