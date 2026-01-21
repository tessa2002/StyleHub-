import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo">
            <div className="logo-square">
              <svg className="logo-hanger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9h12M9 9v12l3-1.5 3 1.5V9M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3" />
              </svg>
            </div>
            <span className="logo-text">StyleHub</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            <Link to="/fabrics" className="nav-link">Fabric Catalog</Link>
            <Link to="/register" className="nav-link">Make an Appointment</Link>
            <Link to="/register" className="nav-link">My Orders</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="nav-actions-desktop">
            <Link to="/login" className="btn-login">Log In</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/fabrics" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Fabric Catalog</Link>
            <Link to="/register" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Make an Appointment</Link>
            <Link to="/register" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
            <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" className="mobile-nav-link btn-register-mobile" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            {/* Left Side - Text Content */}
            <div className="hero-text">
              <div className="hero-label">
                <svg className="label-star-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                AI-POWERED BOUTIQUE MANAGEMENT
              </div>
              <h1 className="hero-title">
                Tailoring <span className="hero-title-accent">Reimagined.</span>
              </h1>
              <p className="hero-description">
                The intelligent assistant for women and children's fashion. Customize designs, manage orders, and book fittings with AI precision.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn-primary">
                  Get Started <span className="btn-arrow">→</span>
                </Link>
                <Link to="/fabrics" className="btn-secondary">
                  <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                  Explore Fabrics
                </Link>
              </div>
              <div className="hero-social-proof">
                <div className="avatar-group">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" 
                    alt="Designer 1" 
                    className="avatar avatar-1"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                    alt="Designer 2" 
                    className="avatar avatar-2"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                    alt="Designer 3" 
                    className="avatar avatar-3"
                  />
                  <div className="avatar avatar-4 avatar-text">
                    <span>10k+</span>
                  </div>
                </div>
                <div className="rating">
                  <div className="stars">
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                  </div>
                </div>
                <span className="happy-designers">Loved by designers</span>
              </div>
            </div>

            {/* Right Side - Visual Cards */}
            <div className="hero-visuals">
              {/* Clothing Rack Card */}
              <div className="visual-card clothing-rack-card">
                <div className="clothing-rack-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&q=80" 
                    alt="Clothing rack with colorful garments"
                    className="clothing-rack-image"
                  />
                </div>
              </div>

              {/* AI Measurements Card */}
              <div className="visual-card ai-card">
                <div className="ai-card-content">
                  <div className="card-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="card-title">AI Measurements</h3>
                  <p className="card-description">Perfect fit guaranteed with our smart scanning technology.</p>
                </div>
              </div>

              {/* Woman Illustration Card */}
              <div className="visual-card woman-card">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&q=80" 
                  alt="Professional woman"
                  className="woman-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Designed for Modern Boutiques</h2>
            <p className="features-subtitle">
              Everything you need to manage your tailoring business and delight your customers, all in one elegant platform.
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              image="https://images.unsplash.com/photo-1582142306909-195724270f89?w=400&h=300&fit=crop"
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              }
              title="Custom Pattern Design"
              description="Create unique patterns for babies and children with our intuitive design tools."
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop"
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              title="Smart Fabric Selector"
              description="Visualize fabrics on 3D models before cutting. Save time and reduce waste."
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop"
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Appointment Manager"
              description="Seamlessly book fittings and consultations. Send automated reminders to clients."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Elevate Your Style?</h2>
          <p className="cta-description">
            Join the community of fashion-forward women and boutique owners. Experience the perfect fit with StyleHub.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-primary">Create Free Account</Link>
            <Link to="/register" className="btn-cta-secondary">View Demo</Link>
          </div>
          <p className="cta-note">No credit card required. 10-day free trial for boutiques.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-square">
                <svg className="logo-hanger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9h12M9 9v12l3-1.5 3 1.5V9M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3" />
                </svg>
              </div>
              <span className="logo-text">StyleHub</span>
            </div>
            <p className="footer-tagline">Intelligent tailoring management for the modern woman.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-column-title">Platform</h3>
              <Link to="/fabrics" className="footer-link">Fabric Catalog</Link>
              <Link to="/register" className="footer-link">3D Fashion</Link>
              <Link to="/register" className="footer-link">Measurements</Link>
            </div>
            <div className="footer-column">
              <h3 className="footer-column-title">Company</h3>
              <Link to="/register" className="footer-link">About Us</Link>
              <Link to="/register" className="footer-link">Careers</Link>
              <Link to="/register" className="footer-link">Contact</Link>
            </div>
            <div className="footer-column">
              <h3 className="footer-column-title">Legal</h3>
              <Link to="/register" className="footer-link">Privacy Policy</Link>
              <Link to="/register" className="footer-link">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">© 2023 StyleHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ image, icon, title, description }) => (
  <div className="feature-card">
    {image && (
      <div className="feature-image-wrapper">
        <img src={image} alt={title} className="feature-image" />
      </div>
    )}
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-card-title">{title}</h3>
    <p className="feature-card-description">{description}</p>
  </div>
);

export default Home;
