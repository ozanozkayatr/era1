import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import "./Homepage.css";

const EventCard = ({ event }) => {
  const [attendingStatus, setAttendingStatus] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(event.comments || []);
  const [likedBy, setLikedBy] = useState(event.likedBy || []);
  const [liked, setLiked] = useState(false);

  const commentsRef = useRef(null);
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  useEffect(() => {
    const initialStatus = event.attendance?.find(
      (att) => att.email === user.email
    )?.status;
    setAttendingStatus(initialStatus || null);

    if (user && likedBy.includes(user.email)) {
      setLiked(true);
    }
  }, [event, user, likedBy]);

  const scrollToBottom = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleAttendingClick = async (status) => {
    setAttendingStatus(status);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/attend`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email, status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update attendance");

      console.log("Attendance successfully updated.");
      window.location.reload();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleLikeClick = async () => {
    const isLiked = liked;
    const updatedLikedBy = isLiked
      ? likedBy.filter((email) => email !== user.email)
      : [...likedBy, user.email];

    setLikedBy(updatedLikedBy);
    setLiked(!isLiked);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email, liked: !isLiked }),
        }
      );

      if (!response.ok) throw new Error("Failed to update likes");

      const updatedEvent = await response.json();
      setLikedBy(updatedEvent.likedBy);
      setLiked(updatedEvent.likedBy.includes(user.email));
    } catch (error) {
      console.error("Error updating likes:", error);

      setLikedBy(likedBy);
      setLiked(isLiked);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user: user?.full_name, text: newComment }),
        }
      );

      if (!response.ok) throw new Error("Failed to add comment");

      setComments([...comments, { user: user?.full_name, text: newComment }]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const { dayName, formattedDate, time } = formatDate(event.date);

  return (
    <div className="event-card">
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>
        <strong>
          {formattedDate}, {dayName}
        </strong>
      </p>
      <p>
        <strong>Time:</strong> {time}
      </p>

      <div className="attend-buttons">
        {["attending", "maybe", "not-attending"].map((status) => (
          <button
            key={status}
            className={`attend-button ${status} ${
              attendingStatus === status ? "active" : "greyed"
            }`}
            onClick={() => handleAttendingClick(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="reaction-count">
        <i className="fa fa-thumbs-up"></i> {likedBy.length}
        <span>{comments.length} comments</span>
      </div>

      <div className="reaction-buttons">
        <button
          className={`reaction-button ${liked ? "liked" : ""}`}
          onClick={handleLikeClick}
        >
          <i className="fa fa-thumbs-up"></i> {liked ? "Liked" : "Like"}
        </button>
        <button className="reaction-button">
          <i className="fa fa-comment"></i> Comment
        </button>
        <button className="reaction-button">
          <i className="fa fa-share"></i> Share
        </button>
      </div>

      <div
        className="comment-section"
        ref={commentsRef}
        style={{ maxHeight: "200px", overflowY: "auto" }}
      >
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <strong>{comment.user}</strong>
              <div className="comment-text">{comment.text}</div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleCommentSubmit}>
        <div className="comment-input">
          <input
            type="text"
            placeholder={`Reply as ${user?.full_name}`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <i className="fa fa-paper-plane" onClick={handleCommentSubmit}></i>
        </div>
      </form>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dayName, formattedDate, time };
};

export default EventCard;
