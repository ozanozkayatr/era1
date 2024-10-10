import React, { useState } from "react";

const CreateEvent = ({ onEventCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !time) return;

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, description, date, time }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();
      onEventCreated(newEvent);

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <>
      <button className="create-event-icon" onClick={() => setIsOpen(true)}>
        <i className="fa fa-plus"></i>
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Event</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEvent;
