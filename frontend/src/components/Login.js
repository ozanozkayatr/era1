import React, { useState } from "react";
import RingLoader from "react-spinners/RingLoader";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
      } else {
        setSuccessMessage(
          `Welcome, ${data.user.full_name || data.user.email}!`
        );
        localStorage.setItem("token", data.token);
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={`login-form ${isLoading ? "loading" : ""}`}
      onSubmit={handleSubmit}
    >
      {isLoading && (
        <div className="spinner-overlay">
          <RingLoader color="#36d7b7" size={75} />
        </div>
      )}

      <div className="input-container">
        <i className="fa fa-envelope icon"></i>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-container">
        <i className="fa fa-lock icon"></i>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <a href="#" className="forgot-password">
        Forgot your password?
      </a>

      <button type="submit" disabled={isLoading}>
        Sign In
      </button>

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
