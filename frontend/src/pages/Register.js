import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const [newsletter, setNewsletter] = useState(false);
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

    if (!pass || pass.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== pass) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setError("");
    setLoading(true);
    
    // Add phone field for backend compatibility
    const registerData = {
      ...formData,
      phone: formData.email, // Temporary, user can update later
    };
    
    const result = await register(registerData);
    setLoading(false);
    
    if (result.success) {
      // Show success message and redirect to login page
      navigate("/login?registered=1", { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked");
  };

  const handleAppleLogin = () => {
    alert("Apple login clicked");
  };

  return (
    <div className="register-page">
      {/* Left Side - Image with Overlay */}
      <div className="register-left">
        <div className="register-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1586350977773-ba6371a6d4ae?w=800&h=1200&fit=crop&q=80&auto=format" 
            alt="Fabric measurement"
            className="register-image"
            loading="eager"
            onLoad={() => console.log('Image loaded successfully')}
            onError={(e) => {
              console.error('Image failed to load, using fallback');
              e.target.src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1200&fit=crop&q=80&auto=format';
            }}
          />
          <div className="register-overlay"></div>
          
          {/* Logo in top left */}
          <div className="register-logo">
            <svg className="register-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
            </svg>
            <span className="register-logo-text">StyleHub</span>
          </div>

          {/* Testimonial at bottom */}
          <div className="register-testimonial">
            <div className="testimonial-quote">
              "StyleHub transformed how I manage my boutique. From measurements to delivery, everything is seamless."
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                  alt="Elena Rodriguez"
                />
              </div>
              <div className="testimonial-info">
                <div className="testimonial-name">Elena Rodriguez</div>
                <div className="testimonial-title">Founder, Bella Couture</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="register-right">
        <div className="register-form-container">
          <div className="register-content">
            <h1 className="register-title">Create an account</h1>
            <p className="register-subtitle">
              Join thousands of designers and boutique owners today.
            </p>

            {error && (
              <div className="register-error-message">
                {error}
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="social-login-top">
              <button type="button" onClick={handleGoogleLogin} className="social-button google-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" onClick={handleAppleLogin} className="social-button apple-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            <div className="social-divider">
              <span>Or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                  required
                />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                  required
                />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showConfirmPassword ? (
                        <>
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
              </div>

              <label className="newsletter-checkbox">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Subscribe to our newsletter for the latest style trends, fabric arrivals, and boutique management tips.</span>
              </label>

              <button type="submit" className="register-button" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="register-login-link">
              Already have an account? <Link to="/login" className="link-highlight">Log in</Link>
            </p>

            <div className="register-footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
