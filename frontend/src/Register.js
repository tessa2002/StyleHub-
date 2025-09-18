import React, { useState } from "react";
import { Link } from "react-router-dom";
import './Auth.css'; // new CSS matching Home page style

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) return alert("You must accept Terms & Policy to continue.");
    console.log("Register Data:", formData);
    // Add registration API call here
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked");
    // Add Google OAuth logic here
  };

  const googleLogo = "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg";

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
            <option value="Tailor">Tailor</option>
            <option value="Staff">Staff</option>
          </select>

          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I accept the <Link to="/terms">Terms & Policy</Link>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>

        <div className="divider">or</div>

        <button className="btn btn-google btn-block" onClick={handleGoogleLogin}>
          <img src={googleLogo} alt="Google logo" className="google-logo" />
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
