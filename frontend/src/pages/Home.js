// frontend/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../logo.svg';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <img src={logo} alt="Style Hub" className="brand-logo" />
            <span className="brand-name">StyleHub</span>
          </div>
          <div className="navbar-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Modern Tailoring
              <span className="highlight"> Management System</span>
            </h1>
            <p className="hero-description">
              Streamline your tailoring business with our comprehensive management platform. 
              Handle orders, customers, measurements, and appointments all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Tailoring Shops</span>
              </div>
              <div className="stat">
                <span className="stat-number">99%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Powerful features designed specifically for tailoring businesses
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="feature-title">Customer Management</h3>
              <p className="feature-description">
                Keep detailed customer profiles with measurements, preferences, and order history.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="feature-title">Order Tracking</h3>
              <p className="feature-description">
                Track orders from initial measurement to final delivery with real-time updates.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <h3 className="feature-title">Measurement Tools</h3>
              <p className="feature-description">
                Digital measurement recording with templates for different garment types.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 className="feature-title">Inventory Management</h3>
              <p className="feature-description">
                Track fabric inventory, materials, and supplies with automated reorder alerts.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="feature-title">Quality Control</h3>
              <p className="feature-description">
                Built-in quality checkpoints and approval workflows for consistent results.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="feature-title">Billing & Payments</h3>
              <p className="feature-description">
                Generate invoices, track payments, and manage financial records seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Built for Modern Tailors</h2>
              <p className="section-description">
                StyleHub combines traditional craftsmanship with modern technology. 
                Our platform is designed by tailors, for tailors, ensuring every feature 
                serves your business needs.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <div className="about-feature-icon">✓</div>
                  <span>Easy to learn and use</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">✓</div>
                  <span>Works on all devices</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">✓</div>
                  <span>24/7 customer support</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">✓</div>
                  <span>Secure and reliable</span>
                </div>
              </div>
              <Link to="/register" className="btn btn-primary">
                Start Your Free Trial
              </Link>
            </div>
            <div className="about-image">
              <div className="about-placeholder">
                <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
                  <rect width="400" height="300" rx="8" fill="#f8fafc"/>
                  <rect x="50" y="50" width="300" height="200" rx="4" fill="#e2e8f0"/>
                  <circle cx="120" cy="120" r="20" fill="#cbd5e1"/>
                  <rect x="160" y="110" width="120" height="8" rx="4" fill="#cbd5e1"/>
                  <rect x="160" y="130" width="80" height="6" rx="3" fill="#e2e8f0"/>
                  <rect x="70" y="170" width="260" height="4" rx="2" fill="#e2e8f0"/>
                  <rect x="70" y="185" width="200" height="4" rx="2" fill="#e2e8f0"/>
                  <rect x="70" y="200" width="240" height="4" rx="2" fill="#e2e8f0"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Join hundreds of satisfied tailoring businesses
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  ★★★★★
                </div>
                <p className="testimonial-text">
                  "StyleHub transformed our business operations. Order management 
                  is now seamless and our customers love the professional service."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">PK</div>
                <div className="author-info">
                  <div className="author-name">Priya Kumar</div>
                  <div className="author-title">Owner, Elite Tailors</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  ★★★★★
                </div>
                <p className="testimonial-text">
                  "The measurement tracking and order management features are 
                  exactly what we needed. Highly recommend to any tailor."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">RS</div>
                <div className="author-info">
                  <div className="author-name">Rahul Sharma</div>
                  <div className="author-title">Master Tailor</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  ★★★★★
                </div>
                <p className="testimonial-text">
                  "Customer management has never been easier. The system is 
                  intuitive and saves us hours every week."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">AM</div>
                <div className="author-info">
                  <div className="author-name">Anita Mehta</div>
                  <div className="author-title">Fashion Designer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Business?</h2>
            <p className="cta-description">
              Join hundreds of tailoring businesses already using StyleHub to 
              streamline their operations and delight their customers.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
            <p className="cta-note">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-description">
                Have questions? We're here to help you get started with StyleHub.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-value">support@stylehub.com</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Phone</div>
                    <div className="contact-value">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-label">Support Hours</div>
                    <div className="contact-value">Mon-Fri 9AM-6PM EST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={logo} alt="StyleHub" className="brand-logo" />
                <span className="brand-name">StyleHub</span>
              </div>
              <p className="footer-description">
                Modern tailoring management system designed to streamline 
                your business operations and delight your customers.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4 className="footer-title">Product</h4>
                <ul className="footer-list">
                  <li><a href="#features">Features</a></li>
                  <li><a href="#about">About</a></li>
                  <li><Link to="/register">Get Started</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Support</h4>
                <ul className="footer-list">
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Documentation</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Legal</h4>
                <ul className="footer-list">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} StyleHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;