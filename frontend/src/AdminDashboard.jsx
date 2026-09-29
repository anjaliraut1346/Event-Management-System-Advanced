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
      alert("Unable to load attendees");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-logo">EMS</div>
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

                  <button
                    className="primary-btn"
                    onClick={() => viewAttendees(event._id)}
                  >
                    View Attendees
                  </button>

                  {selectedEvent === event._id &&
                    attendees[event._id] && (
                      <div className="attendees-list">
                        <h4>Attendees</h4>

                        {attendees[event._id].length === 0 ? (
                          <p>No students registered yet.</p>
                        ) : (
                          attendees[event._id].map((registration) => (
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