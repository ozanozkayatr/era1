import React from "react";

const Signup = () => {
  return (
    <form className="signup-form">
      <div className="input-container">
        <i className="fa fa-user icon"></i>
        <input type="text" placeholder="Name" />
      </div>

      <div className="input-container">
        <i className="fa fa-envelope icon"></i>
        <input type="email" placeholder="Email" />
      </div>

      <div className="input-container">
        <i className="fa fa-lock icon"></i>
        <input type="password" placeholder="Password" />
      </div>

      <div className="input-container">
        <i className="fa fa-lock icon"></i>
        <input type="password" placeholder="Verify Password" />
      </div>

      <button type="submit">Sign Up</button>

      <div className="social-buttons">
        <button className="linkedin-button">
          <i className="fa fa-linkedin"></i>
        </button>
        <button className="google-button">
          <i className="fa fa-google"></i>
        </button>
      </div>
    </form>
  );
};

export default Signup;
