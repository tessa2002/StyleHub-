import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css"; // Home-aligned theme for auth pages
import GoogleButton from "../components/GoogleButton.jsx";
import { useAuth } from "../context/AuthContext";
import logo from "../logo.svg";

const roleToPath = {
  Admin: "/dashboard/admin",
  Tailor: "/dashboard/tailor",
  Staff: "/dashboard/staff",
  Customer: "/dashboard/customer",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [livePasswordError, setLivePasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") {
      // Simple live feedback: show invalid until length >= 6
      setLivePasswordError(value && value.length < 6 ? "Invalid password" : "");
    }
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        console.log('Login successful, user role:', result.user.role);
        const path = roleToPath[result.user.role] || "/";
        console.log('Navigating to:', path);
        
        // Navigate immediately - the auth context now handles the timing
        navigate(path, { replace: true });
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked");
    // Add Google OAuth logic here
  };

  const googleLogo =
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg";

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="brand-header center">
          <img className="brand-logo" src={logo} alt="Style Hub" />
          <span className="brand-name">Style Hub</span>
        </div>
        <h2 className="auth-title">Sign In</h2>

        {errors.general && (
          <div className="field-error" style={{ marginBottom: '16px', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="field-error">{errors.email}</div>}

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
          {(livePasswordError || errors.password) && (
            <div className="field-error warning" role="alert" aria-live="polite">
              <span className="icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span>{livePasswordError || errors.password}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        {/* 🔗 Forgot Password link */}
        <p className="forgot-password">
          <Link to="/reset-password">Forgot Password?</Link>
        </p>

        <div className="divider">or</div>

        {/* Reusable professional Google button */}
        <GoogleButton onClick={handleGoogleLogin} />

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
