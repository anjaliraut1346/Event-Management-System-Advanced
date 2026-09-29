const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "waitlisted", "cancelled"],
      required: true,
      default: "registered",
    },

    attendance: {
      type: String,
      enum: ["Pending", "Attended", "Absent"],
      default: "Pending",
    },

    waitlistPosition: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  { eventId: 1, studentId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);