import React from "react";

const Login = () => {
  return (
    <form className="login-form">
      <div className="input-container">
        <i className="fa fa-envelope icon"></i>
        <input type="email" placeholder="Email" required />
      </div>

      <div className="input-container">
        <i className="fa fa-lock icon"></i>
        <input type="password" placeholder="Password" required />
      </div>

      <a href="#" className="forgot-password">
        Forgot your password?
      </a>

      <button type="submit">Sign In</button>

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

export default Login;
