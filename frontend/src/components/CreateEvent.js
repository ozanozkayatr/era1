import React, { useState } from "react";

const CreateEvent = ({ onEventCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleDescriptionChange = (e) => {
    const words = e.target.value.split(" ");
    if (words.length <= 10) {
      setDescription(e.target.value);
      setDescriptionError("");
    } else {
      setDescriptionError("Description cannot exceed 10 words.");
    }
  };

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
                placeholder="Description (Max 10 words)"
                value={description}
                onChange={handleDescriptionChange}
                required
              />
              {descriptionError && (
                <div className="error-message">{descriptionError}</div>
              )}
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
