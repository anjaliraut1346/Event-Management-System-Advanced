import { useEffect, useState } from "react";

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const studentId = localStorage.getItem("studentId");

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();

      setEvents(data);
    } catch (error) {
      alert("Unable to load events");
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/student/${studentId}`
      );

      const data = await response.json();

      setRegistrations(data);
    } catch (error) {
      alert("Unable to load registration status");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const getRegistration = (eventId) => {
    return registrations.find(
      (registration) =>
        registration.eventId?._id === eventId
    );
  };

  const registerForEvent = async (eventId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            studentId,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        fetchEvents();
        fetchRegistrations();
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const cancelRegistration = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/${eventId}/${studentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        fetchEvents();
        fetchRegistrations();
      }
    } catch (error) {
      alert("Unable to cancel registration");
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

          <h1>Student Dashboard</h1>
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

      <div className="events-section">
        <h2>Upcoming Events</h2>

        {events.length === 0 ? (
          <div className="empty-events">
            <h3>No Events Available</h3>
            <p>Upcoming college events will appear here.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const remainingSeats =
                event.maxSeats - event.registeredSeats;

              const registration = getRegistration(event._id);

              return (
                <div className="event-card" key={event._id}>
                  <div className="event-icon">🎓</div>

                  <h3>{event.name}</h3>

                  <div className="event-info">
                    <p>📅 {event.date}</p>
                    <p>🕐 {event.time}</p>
                  </div>

                  <div className="seats">
                    <span>Available Seats</span>
                    <strong>{remainingSeats}</strong>
                  </div>

                  {registration?.status === "registered" ? (
                    <>
                      <div className="status-box">
                        <strong>✓ Registered</strong>

                        <span>
                          Attendance: {registration.attendance}
                        </span>
                      </div>

                      <button
                        className="cancel-btn"
                        onClick={() =>
                          cancelRegistration(event._id)
                        }
                      >
                        Cancel Registration
                      </button>
                    </>
                  ) : registration?.status === "waitlisted" ? (
                    <>
                      <div className="status-box waitlist-status">
                        <strong>⏳ Waitlisted</strong>

                        <span>
                          Position: #
                          {registration.waitlistPosition}
                        </span>
                      </div>

                      <button
                        className="cancel-btn"
                        onClick={() =>
                          cancelRegistration(event._id)
                        }
                      >
                        Leave Waiting List
                      </button>
                    </>
                  ) : (
                    <button
                      className="primary-btn"
                      onClick={() =>
                        registerForEvent(event._id)
                      }
                    >
                      {remainingSeats === 0
                        ? "⏳ Join Waiting List"
                        : "🎟 Register Now"}
                    </button>
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

export default StudentDashboard;