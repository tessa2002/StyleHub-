import React, { useState } from "react";
import "./Auth.css";
import logo from "../logo.svg";

const ResetPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${email}`);
    // 🔗 Here you can call backend API to send reset email
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="brand-header center">
          <img src={logo} alt="Style Hub logo" className="brand-logo" />
          <span className="brand-name">Style Hub</span>
        </div>
        <h2 className="auth-title">Reset Password</h2>

        <form onSubmit={handleReset}>
          <input
            type="email"
            name="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary btn-block">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
