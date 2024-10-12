import React, { useState, useEffect } from "react";
import EventCard from "./EventCard";
import CreateEvent from "./CreateEvent";
import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import { jwtDecode } from "jwt-decode";
import "./Homepage.css";

const Homepage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const isTokenExpired = (token) => {
    if (!token) return true;
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  };

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      console.error("Token is expired or missing. Redirecting to login.");
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && !isTokenExpired(token)) fetchEvents();
  }, [token]);

  useEffect(() => {
    document.body.className = isDarkMode ? "dark-theme" : "light-theme";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleTheme = () => setIsDarkMode((prevMode) => !prevMode);

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div className="homepage">
      <h1>Welcome to ERA1</h1>
      <div className="header-controls">
        <label className="theme-switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>

        <div className="logout-icon" onClick={handleLogout}>
          <i className="fa fa-sign-out"></i>
        </div>
      </div>

      <CreateEvent onEventCreated={handleEventCreated} />

      {isLoading ? (
        <div className="spinner-container">
          <RingLoader color="#36d7b7" size={50} />
        </div>
      ) : (
        <div className="events-container">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                userName={jwtDecode(token)?.full_name}
              />
            ))
          ) : (
            <p>No events available. Be the first to create one!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Homepage;
