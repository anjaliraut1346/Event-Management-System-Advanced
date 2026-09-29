const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// Create an event
router.post("/", async (req, res) => {
  try {
    const { name, date, time, maxSeats } = req.body;

    if (!name || !date || !time || !maxSeats) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const event = await Event.create({
      name,
      date,
      time,
      maxSeats,
      registeredSeats: 0,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;