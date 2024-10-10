import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import CreateEvent from "./CreateEvent";
import "./Homepage.css";

const Homepage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events");
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

  return (
    <div className="homepage">
      <h1>Welcome to the Event Tracker</h1>

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
