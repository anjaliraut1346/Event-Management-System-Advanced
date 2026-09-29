const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const router = express.Router();

// ======================================================
// REGISTER / JOIN WAITLIST
// ======================================================
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

    // Check previous registration
    const existingRegistration = await Registration.findOne({
      eventId,
      studentId,
    });

    if (
      existingRegistration &&
      existingRegistration.status !== "cancelled"
    ) {
      return res.status(409).json({
        message:
          existingRegistration.status === "registered"
            ? "You are already registered for this event"
            : "You are already on the waiting list",
      });
    }

    // If a cancelled record exists, reuse it
    if (existingRegistration) {
      // Available seat
      if (event.registeredSeats < event.maxSeats) {
        existingRegistration.status = "registered";
        existingRegistration.attendance = "Pending";
        existingRegistration.waitlistPosition = null;

        await existingRegistration.save();

        event.registeredSeats += 1;
        await event.save();

        return res.status(201).json({
          message: "Successfully registered for the event",
          status: "registered",
          remainingSeats:
            event.maxSeats - event.registeredSeats,
        });
      }

      // Join waiting list
      const lastWaitlisted = await Registration.findOne({
        eventId,
        status: "waitlisted",
      }).sort({ waitlistPosition: -1 });

      const position = lastWaitlisted
        ? lastWaitlisted.waitlistPosition + 1
        : 1;

      existingRegistration.status = "waitlisted";
      existingRegistration.attendance = "Pending";
      existingRegistration.waitlistPosition = position;

      await existingRegistration.save();

      return res.status(201).json({
        message: `Event is full. You are #${position} on the waiting list.`,
        status: "waitlisted",
        waitlistPosition: position,
      });
    }

    // ==================================================
    // SEAT AVAILABLE
    // ==================================================
    if (event.registeredSeats < event.maxSeats) {
      await Registration.create({
        eventId,
        studentId,
        status: "registered",
        attendance: "Pending",
        waitlistPosition: null,
      });

      event.registeredSeats += 1;
      await event.save();

      return res.status(201).json({
        message: "Successfully registered for the event",
        status: "registered",
        remainingSeats:
          event.maxSeats - event.registeredSeats,
      });
    }

    // ==================================================
    // EVENT FULL → WAITLIST
    // ==================================================
    const lastWaitlisted = await Registration.findOne({
      eventId,
      status: "waitlisted",
    }).sort({ waitlistPosition: -1 });

    const position = lastWaitlisted
      ? lastWaitlisted.waitlistPosition + 1
      : 1;

    await Registration.create({
      eventId,
      studentId,
      status: "waitlisted",
      attendance: "Pending",
      waitlistPosition: position,
    });

    return res.status(201).json({
      message: `Event is full. You are #${position} on the waiting list.`,
      status: "waitlisted",
      waitlistPosition: position,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// CANCEL REGISTRATION
// ======================================================
router.delete("/:eventId/:studentId", async (req, res) => {
  try {
    const { eventId, studentId } = req.params;

    const registration = await Registration.findOne({
      eventId,
      studentId,
    });

    if (!registration || registration.status === "cancelled") {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // ==================================================
    // CANCEL WAITLISTED STUDENT
    // ==================================================
    if (registration.status === "waitlisted") {
      const cancelledPosition = registration.waitlistPosition;

      registration.status = "cancelled";
      registration.waitlistPosition = null;

      await registration.save();

      // Move positions forward
      await Registration.updateMany(
        {
          eventId,
          status: "waitlisted",
          waitlistPosition: {
            $gt: cancelledPosition,
          },
        },
        {
          $inc: {
            waitlistPosition: -1,
          },
        }
      );

      return res.json({
        message: "You have been removed from the waiting list",
      });
    }

    // ==================================================
    // CANCEL REGISTERED STUDENT
    // ==================================================
    registration.status = "cancelled";
    registration.attendance = "Pending";

    await registration.save();

    event.registeredSeats -= 1;

    if (event.registeredSeats < 0) {
      event.registeredSeats = 0;
    }

    await event.save();

    // ==================================================
    // PROMOTE FIRST WAITLISTED STUDENT
    // ==================================================
    const nextStudent = await Registration.findOne({
      eventId,
      status: "waitlisted",
    }).sort({ waitlistPosition: 1 });

    if (nextStudent) {
      nextStudent.status = "registered";
      nextStudent.attendance = "Pending";
      nextStudent.waitlistPosition = null;

      await nextStudent.save();

      event.registeredSeats += 1;
      await event.save();

      // Re-number remaining waitlist
      const remainingWaitlist = await Registration.find({
        eventId,
        status: "waitlisted",
      }).sort({ waitlistPosition: 1 });

      for (let i = 0; i < remainingWaitlist.length; i++) {
        remainingWaitlist[i].waitlistPosition = i + 1;
        await remainingWaitlist[i].save();
      }

      return res.json({
        message:
          "Registration cancelled and the next student was promoted",
        promotedStudentId: nextStudent.studentId,
      });
    }

    return res.json({
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// GET ALL REGISTRATIONS FOR AN EVENT
// ======================================================
router.get("/event/:eventId", async (req, res) => {
  try {
    const registrations = await Registration.find({
      eventId: req.params.eventId,
    })
      .populate("studentId", "name email")
      .sort({
        status: 1,
        waitlistPosition: 1,
      });

    res.json(registrations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// GET STUDENT'S STATUS FOR ALL EVENTS
// ======================================================
router.get("/student/:studentId", async (req, res) => {
  try {
    const registrations = await Registration.find({
      studentId: req.params.studentId,
      status: {
        $in: ["registered", "waitlisted"],
      },
    }).populate("eventId");

    res.json(registrations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// MARK ATTENDANCE
// ======================================================
router.put("/:registrationId/attendance", async (req, res) => {
  try {
    const { attendance } = req.body;

    if (!["Attended", "Absent"].includes(attendance)) {
      return res.status(400).json({
        message: "Attendance must be Attended or Absent",
      });
    }

    const registration = await Registration.findById(
      req.params.registrationId
    );

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    if (registration.status !== "registered") {
      return res.status(400).json({
        message: "Only registered students can have attendance marked",
      });
    }

    registration.attendance = attendance;

    await registration.save();

    res.json({
      message: `Attendance marked as ${attendance}`,
      registration,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;