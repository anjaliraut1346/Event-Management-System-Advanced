import { useEffect, useState } from "react";

function StudentDashboard() {
  const [events, setEvents] = useState([]);

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

  useEffect(() => {
    fetchEvents();
  }, []);

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
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-logo">EMS</div>
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

                  <button
                    className="primary-btn"
                    onClick={() => registerForEvent(event._id)}
                    disabled={remainingSeats === 0}
                  >
                    {remainingSeats === 0
                      ? "Event Full"
                      : "Register Now"}
                  </button>
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