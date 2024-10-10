import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";

const EventCard = ({ event }) => {
  const [isAttending, setIsAttending] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(event.comments || []);
  const [likes, setLikes] = useState(event.likes || 0);
  const [liked, setLiked] = useState(false);

  const commentsRef = useRef(null);

  const scrollToBottom = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  /**
   * Format the event date and return the day, formatted date, and time
   * @param {string} dateString - The date string from the event object
   * @returns {Object} - Returns an object containing the dayName, formattedDate, and time
   */
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

  const { dayName, formattedDate, time } = formatDate(event.date);

  /**
   * Handle the selection of attendance status
   * @param {boolean|string} status - The status indicating whether attending, maybe, or not attending
   */
  const handleAttendingClick = (status) => {
    setIsAttending(status);
  };

  /**
   * Handle the submission of a new comment
   * @param {Object} e - Event object from form submission
   */
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ user: "Ozan Özkaya", text: newComment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setComments([...comments, { user: "Ozan Özkaya", text: newComment }]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeClick = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ liked: !liked }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update likes");
      }

      setLikes(liked ? likes - 1 : likes + 1);
      setLiked(!liked);
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
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
      </div>
      <div className="attend-buttons">
        <button
          className={`attend-button attending ${
            isAttending === true ? "active" : ""
          }`}
          onClick={() => handleAttendingClick(true)}
        >
          Attending
        </button>
        <button
          className={`attend-button maybe ${
            isAttending === "maybe" ? "active" : ""
          }`}
          onClick={() => handleAttendingClick("maybe")}
        >
          Maybe
        </button>
        <button
          className={`attend-button not-attending ${
            isAttending === false ? "active" : ""
          }`}
          onClick={() => handleAttendingClick(false)}
        >
          Not Attending
        </button>
      </div>

      <div className="reaction-count">
        <i className="fa fa-thumbs-up"></i> {likes}
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
            placeholder="Reply as Ozan Özkaya"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <i className="fa fa-paper-plane" onClick={handleCommentSubmit}></i>
        </div>
      </form>
    </div>
  );
};

export default EventCard;
