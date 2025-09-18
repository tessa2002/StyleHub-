import React from "react";

// Inline Google "G" icon to avoid external image loading issues
const GoogleIcon = () => (
  <svg
    className="google-logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.4 5.1 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.2-.1-2.5-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.6 19 14 24 14c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.4 5.1 29.5 3 24 3 15.2 3 7.6 7.9 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.1 36.7 26.7 37.5 24 37.5c-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C8 40.1 15.3 45 24 45z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-3 5-5.5 6.5l6.3 5.2C38.2 36.2 41 30.7 41 24c0-1.2-.1-2.5-.4-3.5z"/>
  </svg>
);

// Reusable Google Sign-In button with loading state and a11y
const GoogleButton = ({
  text = "Continue with Google",
  onClick,
  loading = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      className={`btn btn-google btn-block ${className}`}
      onClick={onClick}
      disabled={loading}
      aria-label={text}
    >
      {loading ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <GoogleIcon />
      )}
      <span className="label">{text}</span>
    </button>
  );
};

export default GoogleButton;