import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../context/AuthContext";

// Load Google Identity Services
const loadGoogleScript = () => {
  return new Promise((resolve) => {
    if (window.google) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

const roleToPath = {
  Admin: "/admin/dashboard",
  Tailor: "/dashboard/tailor",
  Staff: "/dashboard/staff",
  Customer: "/dashboard/customer",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setExpiredMessage('Your session has expired. Please login again.');
      window.history.replaceState({}, '', '/login');
    }
    if (params.get('registered') === '1') {
      setSuccessMessage('Registration successful! Please login with your credentials.');
      window.history.replaceState({}, '', '/login');
    }

    // Initialize Google Sign-In
    initializeGoogleSignIn();
  }, [location]);

  const initializeGoogleSignIn = async () => {
    try {
      await loadGoogleScript();
      
      if (window.google) {
        // Get the client ID from environment variable
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        
        console.log('🔍 Google Client ID check:', {
          clientId: clientId ? 'Found' : 'Not found',
          value: clientId ? clientId.substring(0, 20) + '...' : 'undefined'
        });
        
        if (!clientId) {
          console.warn('⚠️ REACT_APP_GOOGLE_CLIENT_ID not found in environment variables');
          return;
        }
        
        // Initialize Google Sign-In with any Client ID (even demo ones for testing)
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          itp_support: true
        });
        
        console.log('✅ Google Sign-In initialized successfully with FedCM');
        
        // Also render the button immediately so it's ready as a fallback
        renderGoogleButton();
      }
    } catch (error) {
      console.error('Failed to load Google Sign-In:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        if (!result.user || !result.user.role) {
          setErrors({ general: 'Login failed: Invalid server response' });
          return;
        }
        
        const path = roleToPath[result.user.role] || "/";
        navigate(path, { replace: true });
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    try {
      console.log('🔍 Google response received');
      
      // Use the AuthContext's loginWithGoogle method
      const result = await loginWithGoogle({ credential: response.credential });
      
      if (result.success) {
        // Navigate to appropriate dashboard
        const path = roleToPath[result.user.role] || "/dashboard/customer";
        navigate(path, { replace: true });
        setSuccessMessage(`Welcome ${result.user.name}! Signed in with Google.`);
      } else {
        setErrors({ general: result.error || 'Google login failed' });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ general: 'Google login failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    console.log('🔍 Google button clicked!');
    
    if (!clientId) {
      console.error('❌ No Client ID found');
      setErrors({ 
        general: 'Google Sign-In not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.' 
      });
      return;
    }
    
    if (!window.google) {
      console.error('❌ Google library not loaded');
      setErrors({ general: 'Google Sign-In library not loaded. Please refresh the page.' });
      return;
    }
    
    console.log('✅ Attempting to show Google prompt with FedCM...');
    
    try {
      // With FedCM, prompt() is the recommended way to start the flow
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.warn('⚠️ Google prompt not displayed');
          renderGoogleButton();
        } else if (notification.isSkippedMoment()) {
          console.warn('⚠️ Google prompt skipped');
          renderGoogleButton();
        }
      });
    } catch (error) {
      console.error('❌ Google prompt error:', error);
      renderGoogleButton();
    }
  };
  
  const renderGoogleButton = () => {
    console.log('🔄 Rendering Google button...');
    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer && window.google) {
      buttonContainer.innerHTML = ''; // Clear existing content
      buttonContainer.style.display = 'block';
      try {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 200
        });
        console.log('✅ Google button rendered successfully');
      } catch (error) {
        console.error('❌ Error rendering Google button:', error);
      }
    } else {
      console.error('❌ Button container or Google library not found');
    }
  };

  const handleAppleLogin = () => {
    alert("Apple login clicked");
  };

  return (
    <div className="login-page">
      {/* Left Side - Image with Overlay */}
      <div className="login-left">
        <div className="login-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1200&fit=crop&q=80" 
            alt="Clothing rack"
            className="login-image"
          />
          <div className="login-overlay">
            <div className="overlay-content">
              <div className="overlay-logo">
                <svg className="overlay-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9h12M9 9v12l3-1.5 3 1.5V9M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3" />
                </svg>
                <span className="overlay-logo-text">StyleHub</span>
              </div>
              <p className="overlay-tagline">
                The intelligent tailoring assistant designed for modern boutiques and fashion lovers.
              </p>
              <div className="overlay-social-proof">
                <div className="overlay-avatars">
                  <div className="overlay-avatar"></div>
                  <div className="overlay-avatar"></div>
                  <div className="overlay-avatar"></div>
                </div>
                <span className="overlay-text">Joined by 10,000+ designers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <Link to="/register" className="create-account-link">
              New here? <span className="link-highlight">Create an account</span>
            </Link>
          </div>

          <div className="login-content">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Manage your style journey with ease. Please enter your details.
            </p>

            {successMessage && (
              <div className="login-success-message" style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✅ {successMessage}
              </div>
            )}

            {expiredMessage && (
              <div className="login-error-message">
                ⏰ {expiredMessage}
              </div>
            )}
            
            {errors.general && (
              <div className="login-error-message">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email or Username</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email or username"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  required
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
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
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/reset-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="social-login">
              <div className="social-divider">
                <span>Or continue with</span>
              </div>
              <div className="social-buttons">
                <div className="google-button-container">
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    className="social-button google-button"
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <div className="google-loading-spinner"></div>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    {googleLoading ? 'Signing in...' : 'Google'}
                  </button>
                  <div 
                    id="google-signin-button" 
                    style={{ 
                      display: 'none', 
                      width: '100%', 
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  ></div>
                </div>
                <button type="button" onClick={handleAppleLogin} className="social-button apple-button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            <div className="login-copyright">
              © 2023 StyleHub. Intelligent Tailoring System.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
