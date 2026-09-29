import { useEffect, useState } from "react";

function AdminDashboard() {
  const [event, setEvent] = useState({
    name: "",
    date: "",
    time: "",
    maxSeats: "",
  });

  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      alert("Unable to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        setEvent({
          name: "",
          date: "",
          time: "",
          maxSeats: "",
        });

        fetchEvents();
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const viewAttendees = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/event/${eventId}`
      );

      const data = await response.json();

      setAttendees({
        ...attendees,
        [eventId]: data,
      });

      setSelectedEvent(eventId);
    } catch (error) {
      alert("Unable to load students");
    }
  };

  const markAttendance = async (registrationId, attendance) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/${registrationId}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendance,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok && selectedEvent) {
        viewAttendees(selectedEvent);
      }
    } catch (error) {
      alert("Unable to update attendance");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div className="brand-logo">
            <div className="brand-icon">🎓</div>

            <div className="brand-text">
              <strong>EventSphere</strong>
              <small>College Event Management</small>
            </div>
          </div>

          <h1>Admin Dashboard</h1>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-card">
        <h2>Create New Event</h2>
        <p>Add an upcoming college event for students.</p>

        <form onSubmit={handleSubmit}>
          <label>Event Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter event name"
            value={event.name}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <div>
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={event.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Time</label>

              <input
                type="time"
                name="time"
                value={event.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Maximum Seats</label>

          <input
            type="number"
            name="maxSeats"
            placeholder="Enter maximum seats"
            min="1"
            value={event.maxSeats}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            + Create Event
          </button>
        </form>
      </div>

      <div className="events-section">
        <h2>Event Overview</h2>

        {events.length === 0 ? (
          <div className="empty-events">
            <h3>No Events Available</h3>
            <p>Create an event to see it here.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const remainingSeats =
                event.maxSeats - event.registeredSeats;

              const eventAttendees = attendees[event._id] || [];

              const registeredStudents = eventAttendees.filter(
                (registration) =>
                  registration.status === "registered"
              );

              const waitlistedStudents = eventAttendees.filter(
                (registration) =>
                  registration.status === "waitlisted"
              );

              return (
                <div className="event-card" key={event._id}>
                  <div className="event-icon">🎓</div>

                  <h3>{event.name}</h3>

                  <div className="event-info">
                    <p>📅 {event.date}</p>
                    <p>🕐 {event.time}</p>
                  </div>

                  <div className="seats">
                    <span>Registered</span>
                    <strong>{event.registeredSeats}</strong>
                  </div>

                  <div className="seats">
                    <span>Remaining Seats</span>
                    <strong>{remainingSeats}</strong>
                  </div>

                  <div className="seats">
                    <span>Waitlisted</span>
                    <strong>{waitlistedStudents.length}</strong>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() => viewAttendees(event._id)}
                  >
                    View Students
                  </button>

                  {selectedEvent === event._id && (
                    <div className="attendees-list">
                      <h4>Registered Students</h4>

                      {registeredStudents.length === 0 ? (
                        <p>No registered students.</p>
                      ) : (
                        registeredStudents.map((registration) => (
                          <div
                            className="attendee"
                            key={registration._id}
                          >
                            <strong>
                              {registration.studentId?.name}
                            </strong>

                            <span>
                              {registration.studentId?.email}
                            </span>

                            <div className="attendance-controls">
                              <button
                                className="attendance-btn"
                                onClick={() =>
                                  markAttendance(
                                    registration._id,
                                    "Attended"
                                  )
                                }
                              >
                                ✓ Attended
                              </button>

                              <button
                                className="attendance-btn absent-btn"
                                onClick={() =>
                                  markAttendance(
                                    registration._id,
                                    "Absent"
                                  )
                                }
                              >
                                ✕ Absent
                              </button>
                            </div>

                            <small>
                              Attendance:{" "}
                              {registration.attendance}
                            </small>
                          </div>
                        ))
                      )}

                      <h4>Waiting List</h4>

                      {waitlistedStudents.length === 0 ? (
                        <p>No students on the waiting list.</p>
                      ) : (
                        waitlistedStudents.map((registration) => (
                          <div
                            className="attendee waitlisted-attendee"
                            key={registration._id}
                          >
                            <strong>
                              #{registration.waitlistPosition}{" "}
                              {registration.studentId?.name}
                            </strong>

                            <span>
                              {registration.studentId?.email}
                            </span>

                            <small>⏳ Waiting List</small>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;