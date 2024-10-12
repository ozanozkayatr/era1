import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import { useNavigate } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import "./AuthContainer.css";

const AuthContainer = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setIsSignup((prev) => !prev);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsLoading(false);
    navigate("/homepage");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleLoading = (loading) => setIsLoading(loading);

  return (
    <div className="App">
      <div className={`auth-container ${isSignup ? "signup-mode" : ""}`}>
        {isLoading && (
          <div className="spinner-overlay">
            <RingLoader color="#36d7b7" size={75} />
          </div>
        )}

        <div className={`form-box form-left ${isLoading ? "loading" : ""}`}>
          {!isSignup && (
            <>
              <h2>Welcome Back!</h2>
              <Login
                onLoginSuccess={handleLoginSuccess}
                onLoading={handleLoading}
              />
            </>
          )}
        </div>

        <div className={`form-box form-right ${isLoading ? "loading" : ""}`}>
          {isSignup && (
            <>
              <h2>Create Account</h2>
              <Signup />
            </>
          )}
        </div>

        <div className={`green-panel ${isLoading ? "loading" : ""}`}>
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
    </div>
  );
};

export default AuthContainer;
