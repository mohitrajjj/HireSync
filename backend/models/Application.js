const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "accepted", "rejected"],
      default: "applied",
    },
    resume: {
      type: String,
    },
    resumeSize: {
      type: Number,
    },
    notes: {
      type: String,
    },
    interviewLink: {
      type: String,
    },
    interviewDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
