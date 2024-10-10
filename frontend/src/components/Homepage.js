import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import CreateEvent from "./CreateEvent";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="homepage">
      <h1>Welcome to ERA1</h1>

      {/* Logout Icon */}
      <div className="logout-icon" onClick={handleLogout}>
        <i className="fa fa-sign-out"></i>
      </div>

      {/* Create Event Form */}
      <CreateEvent onEventCreated={handleEventCreated} />

      <div className="events-container">
        {events.length > 0 ? (
          events.map((event) => <EventCard key={event._id} event={event} />)
        ) : (
          <p>No events available. Be the first to create one!</p>
        )}
      </div>
    </div>
  );
};

export default Homepage;
