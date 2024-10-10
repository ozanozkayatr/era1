import React, { useState } from "react";

const Signup = () => {
  const [fullName, setFullName] = useState("Ozan Özkaya");
  const [email, setEmail] = useState("ozancanozkaya@gmail.com");
  const [password, setPassword] = useState("123123");
  const [confirmPassword, setConfirmPassword] = useState("123123");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const data = await response.json();
      console.log("Signup successful", data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSignup}>
      <div className="input-container">
        <i className="fa fa-user icon"></i>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="input-container">
        <i className="fa fa-envelope icon"></i>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      <div className="input-container">
        <i className="fa fa-lock icon"></i>
        <input
          type="password"
          placeholder="Verify Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button type="submit">Sign Up</button>

      <div className="social-buttons">
        <button type="button" className="linkedin-button">
          <i className="fa fa-linkedin"></i>
        </button>
        <button type="button" className="google-button">
          <i className="fa fa-google"></i>
        </button>
      </div>
    </form>
  );
};

export default Signup;
