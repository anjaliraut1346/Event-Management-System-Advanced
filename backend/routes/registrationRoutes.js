const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

const router = express.Router();

// Register student for an event
router.post("/", async (req, res) => {
  try {
    const { eventId, studentId } = req.body;

    if (!eventId || !studentId) {
      return res.status(400).json({
        message: "Event ID and Student ID are required",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.registeredSeats >= event.maxSeats) {
      return res.status(400).json({
        message: "Registration is full",
      });
    }

    const existingRegistration = await Registration.findOne({
      eventId,
      studentId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You are already registered for this event",
      });
    }

    const registration = await Registration.create({
      eventId,
      studentId,
    });

    event.registeredSeats += 1;
    await event.save();

    res.status(201).json({
      message: "Successfully registered for the event",
      registration,
      remainingSeats: event.maxSeats - event.registeredSeats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get attendee list for an event
router.get("/event/:eventId", async (req, res) => {
  try {
    const registrations = await Registration.find({
      eventId: req.params.eventId,
    }).populate("studentId", "name email");

    res.json(registrations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;