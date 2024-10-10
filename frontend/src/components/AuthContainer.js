// src/components/AuthContainer.js

import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./AuthContainer.css";

const AuthContainer = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className={`auth-container ${isSignup ? "signup-mode" : ""}`}>
      <div className="form-box form-left">
        {!isSignup && (
          <>
            <h2>Welcome Back!</h2>
            <Login />
          </>
        )}
      </div>

      <div className="form-box form-right">
        {isSignup && (
          <>
            <h2>Create Account</h2>
            <Signup />
          </>
        )}
      </div>

      {/* Green sliding panel with the toggle button */}
      <div className="green-panel">
        {isSignup ? (
          <>
            <h1>Welcome Back!</h1>
            <p>You already have an account? Please sign in</p>
            <button onClick={toggleForm} className="panel-toggle-button">
              Sign In
            </button>
          </>
        ) : (
          <>
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start your journey</p>

            <button onClick={toggleForm} className="panel-toggle-button">
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
