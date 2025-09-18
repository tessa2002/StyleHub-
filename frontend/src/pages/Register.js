import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "../components/GoogleButton.jsx";
import { useAuth } from "../context/AuthContext";
import "./Register.css"; // Layout + form styles
import "./Auth.css"; // Home-aligned theme for auth pages (shared buttons, inputs)
import logo from "../logo.svg";

const roleToPath = {
  Admin: "/dashboard/admin",
  Tailor: "/dashboard/tailor",
  Staff: "/dashboard/staff",
  Customer: "/dashboard/customer",
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Customer", // Fixed to Customer
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const pass = formData.password || "";

    if (!formData.name.trim()) errs.name = "Full name is required";

    if (!emailRegex.test(formData.email)) errs.email = "Enter a valid email address";

    // Phone basic validation (optional but recommended)
    if (!formData.phone || formData.phone.trim().length < 7) {
      errs.phone = "Phone number is required";
    }

    // Strong password: 8+ chars, upper, lower, digit, special
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-])[A-Za-z\d@$!%*?&#^()_\-]{8,}$/;
    if (!strong.test(pass)) {
      errs.password = "Min 8 chars incl. upper, lower, number, special";
    }

    // Confirm password match
    if (!formData.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== pass) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError("⚠️ You must accept Terms & Policy to continue.");
      return;
    }

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setError("");
    setLoading(true);
    
    const result = await register(formData);
    setLoading(false);
    
    if (result.success) {
      // User is automatically logged in and redirected to customer dashboard
      navigate("/dashboard/customer", { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked");
    // TODO: Add actual Google OAuth logic later
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="brand-header center">
          <img src={logo} alt="Style Hub logo" className="brand-logo" />
          <span className="brand-name">Style Hub</span>
        </div>
        <h1>Create Account</h1>
        <p>Join Style Hub today and manage your boutique efficiently.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}

        <div className={`password-field ${formData.password ? 'has-eye' : ''}`}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {formData.password && (
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="4" y1="20" x2="20" y2="4" />
                </svg>
              )}
            </button>
          )}
        </div>
        {fieldErrors.password && (
          <div className="field-error warning" role="alert" aria-live="polite">
            <span className="icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span>{fieldErrors.password}</span>
          </div>
        )}

        {/* Confirm Password */}
        <div className={`password-field ${formData.confirmPassword ? 'has-eye' : ''}`}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {formData.confirmPassword && (
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword((s) => !s)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="4" y1="20" x2="20" y2="4" />
                </svg>
              )}
            </button>
          )}
        </div>
        {fieldErrors.confirmPassword && (
          <div className="field-error warning" role="alert" aria-live="polite">
            <span className="icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span>{fieldErrors.confirmPassword}</span>
          </div>
        )}

        {/* Role is fixed to Customer for public registration */}
        <input type="hidden" name="role" value="Customer" />

        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          I accept the <Link to="/terms">Terms & Policy</Link>
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Now"}
        </button>
      </form>

      <div className="divider">OR</div>

      {/* Reusable professional Google button */}
      <GoogleButton onClick={handleGoogleLogin} />
      
      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
    </div>
  );
};

export default Register;
