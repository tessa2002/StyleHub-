// frontend/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../logo.svg';

const Home = () => {
  return (
    <div className="home-container">
      <div className="container">
        {/* Navigation Header */}
        <nav className="navbar" aria-label="Primary">
          <div className="navbar-brand">
            <img src={logo} alt="Style Hub logo" className="brand-logo" />
            <h1>Style Hub</h1>
          </div>
          <div className="navbar-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#reviews">Reviews</a>
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="btn btn-primary nav-cta">Get Started</Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <div className="container" role="region" aria-label="Hero">
          <h1>Style Hub</h1>
          <p className="subtitle">Smarter Tailoring. Faster Service. Happier Customers.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-secondary" aria-label="Get started with Style Hub">Get Started</Link>
            <a href="#features" className="btn btn-outline" aria-label="Explore features">Explore Features</a>
          </div>
        </div>
      </header>

      {/* Trusted By */}
      <section className="trusted">
        <div className="container">
          <span className="trusted-label">Trusted by boutiques and tailoring teams</span>
          <div className="trusted-logos" aria-hidden="true">
            <span>Silk & Thread</span>
            <span>Maison Couture</span>
            <span>TailorWorks</span>
            <span>Golden Stitch</span>
            <span>Urban Atelier</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            {[{ icon: '👤', title: 'Customer Management', desc: 'Store customer data, measurements & past orders.' }, { icon: '📅', title: 'Appointments & Orders', desc: 'Schedule, assign, and track custom orders easily.' }, { icon: '✂️', title: 'Measurements & Styles', desc: 'Digitally manage body measurements & style details.' }, { icon: '🧵', title: 'Fabric & Inventory', desc: 'Track stock, usage & auto reorder fabrics.' }, { icon: '🤖', title: 'AI Recommender', desc: 'Get AI-powered style suggestions based on body type & history.' }, { icon: '💳', title: 'Billing & Payments', desc: 'Smart billing with receipts, partial payments & history.' }].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-subtitle">Get started in minutes and grow with features crafted for boutique workflows.</p>
          <div className="how-grid">
            <div className="how-box">
              <h3>1. Create your account</h3>
              <p>Set up your boutique profile and invite your team.</p>
            </div>
            <div className="how-box">
              <h3>2. Add customers and orders</h3>
              <p>Capture measurements, preferences, and order timelines.</p>
            </div>
            <div className="how-box">
              <h3>3. Track and deliver</h3>
              <p>Manage progress and deliver on time with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Transform Your Tailoring Shop Today</h2>
          <p>Digitize operations. Delight customers. Drive growth.</p>
          <Link to="/register" className="btn btn-secondary">Start Free Demo</Link>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews">
        <div className="container">
          <h2>What our users say</h2>
          <p className="section-subtitle">Trusted by boutique owners and tailoring teams.</p>
          <div className="reviews-grid">
            <div className="review-card">
              <blockquote>
                "Style Hub streamlined our entire workflow. Highly recommended!"
              </blockquote>
              <figcaption className="review-author">Priya Kumar — Boutique Owner</figcaption>
            </div>
            <div className="review-card">
              <blockquote>
                "Managing orders and customers is finally simple and reliable."
              </blockquote>
              <figcaption className="review-author">Rahul Sharma — Tailor</figcaption>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container footer-grid">
          <div className="footer-column">
            <h4>Style Hub</h4>
            <p>Elegant management for modern boutiques and tailoring studios.</p>
          </div>
          <div className="footer-column">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><Link to="/register">Get started</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help center</a></li>
              <li><a href="#">Status</a></li>
              <li><a href="mailto:info@stylehub.com">Contact</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} Style Hub — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;