import React, { useState } from "react";

const CommentSection = ({ comments }) => {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState(comments);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() !== "") {
      setCommentList([...commentList, { user: "You", text: newComment }]);
      setNewComment(""); // Clear input
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      <ul>
        {commentList.map((comment, index) => (
          <li key={index}>
            <strong>{comment.user}:</strong> {comment.text}
          </li>
        ))}
      </ul>

      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CommentSection;
