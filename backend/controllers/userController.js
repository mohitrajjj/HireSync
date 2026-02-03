const User = require("../models/User");

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me (multipart form with optional resume)
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, bio, skills } = req.body;
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (skills !== undefined) {
      // accept comma-separated string or array
      if (typeof skills === "string") {
        user.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(skills)) {
        user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
      }
    }

    if (req.file) {
      user.resume = req.file.path; // stored path
    }

    await user.save();
    res.json({ message: "Profile updated", user: await User.findById(req.user._id).select("-password") });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, updateMyProfile };
