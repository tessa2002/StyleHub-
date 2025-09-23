import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      if (e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo and Brand Name */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l2 2 4-4m6 10H6a2 2 0 01-2-2V6a2 2 0 012-2h11a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-gray-900">Style Hub</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium">How it Works</a>
            <a href="#reviews" className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium">Reviews</a>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium">Sign In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">Get Started</Link>
          </div>

          {/* Mobile Navigation (Hamburger Menu) */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-blue-600 transition duration-300 font-medium">Features</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-blue-600 transition duration-300 font-medium">How it Works</a>
              <a href="#reviews" className="block text-gray-600 hover:text-blue-600 transition duration-300 font-medium">Reviews</a>
              <Link to="/login" className="block text-gray-600 hover:text-blue-600 transition duration-300 font-medium">Sign In</Link>
              <Link to="/register" className="block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Professional Tailor's Atelier Design */}
      <section className="relative min-h-screen flex items-center justify-center text-center p-4 overflow-hidden">
        {/* Background - Tailor's Atelier */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" 
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2558&auto=format&fit=crop')`,
            filter: 'blur(1px)'
          }}
        ></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-amber-900/40"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between">
          {/* Left Content */}
          <div className="lg:w-1/2 text-left lg:pr-12 mb-12 lg:mb-0">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Style Hub – <span className="text-amber-300">Tailoring Management,</span> Perfected.
            </h1>
            
            {/* Body Text */}
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mb-10 leading-relaxed">
              Digitize your boutique. Streamline orders, measurements, and customer data in one secure, AI-powered platform. 
              Bridge the gap between traditional craftsmanship and modern efficiency.
            </p>
            
            {/* CTA Button */}
            <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-xl inline-flex items-center space-x-2">
              <span>Book a Demo</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            {/* Footer Badges */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="bg-white/20 px-4 py-2 rounded-full">Web-Based</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">AI Recommendations</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Secure & Compliant</span>
            </div>
          </div>

          {/* Right Content - Tablet Interface Mockup */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Tablet Device */}
              <div className="w-80 h-96 bg-gray-900 rounded-2xl p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                  {/* Tablet Interface */}
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4">
                      <h3 className="font-bold text-lg">Style Hub Dashboard</h3>
                      <p className="text-blue-100 text-sm">Customer Profile</p>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 space-y-4">
                      {/* Customer Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">SJ</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                          <p className="text-sm text-gray-600">Premium Client</p>
                        </div>
                      </div>
                      
                      {/* Measurements */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Measurements</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Chest:</span>
                            <span className="font-medium">38"</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Waist:</span>
                            <span className="font-medium">32"</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hip:</span>
                            <span className="font-medium">40"</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Length:</span>
                            <span className="font-medium">42"</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Design Sketch */}
                      <div className="bg-amber-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Design Sketch</h5>
                        <div className="w-full h-16 bg-gradient-to-r from-blue-200 to-amber-200 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything Your Boutique Needs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16 text-lg">
            From customer management to AI-powered recommendations, Style Hub brings your tailoring business into the digital age.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Customer Management" 
              description="Maintain detailed profiles and history for every client." 
              icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
            <FeatureCard 
              title="Measurement Records" 
              description="Digitize and store client measurements for easy access." 
              icon="M9 19V6.5a2.5 2.5 0 015 0V19a2 2 0 00-2 2h-1a2 2 0 00-2-2z"
            />
            <FeatureCard 
              title="Order Management" 
              description="Track every order from initial consultation to final delivery." 
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
            <FeatureCard 
              title="Fabric & Inventory" 
              description="Keep track of fabric, threads, and supplies." 
              icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
            <FeatureCard 
              title="AI Recommendations" 
              description="Suggest styles and designs to clients using AI." 
              icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
            <FeatureCard 
              title="Billing & Payments" 
              description="Generate professional invoices and accept secure payments." 
              icon="M17 9.5a2.5 2.5 0 01-2.5 2.5H12a2 2 0 01-2-2V7.5A2.5 2.5 0 0112.5 5H15a2 2 0 012 2.5V9.5z"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A simple, four-step process to transform your tailoring business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number="1" 
              title="Sign up & create profile" 
              description="Start by creating a profile for your shop and services." 
              icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
            <StepCard 
              number="2" 
              title="Manage orders & appointments" 
              description="Add new customer orders and track their progress in real-time." 
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
            <StepCard 
              number="3" 
              title="Track customer measurements & history" 
              description="View and update customer measurements, history, and preferences." 
              icon="M9 19V6.5a2.5 2.5 0 015 0V19a2 2 0 00-2 2h-1a2 2 0 00-2-2z"
            />
            <StepCard 
              number="4" 
              title="Get AI recommendations & insights" 
              description="Use AI recommendations and analytics to grow your business." 
              icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What Our Users Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join thousands of satisfied tailoring professionals who have transformed their business with Style Hub.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReviewCard 
                name="Sarah Johnson" 
                title="Owner, Elite Tailoring Studio" 
                review="StyleHub has completely transformed how I manage my business. The customer management system is incredible, and the AI recommendations have increased my sales by 40%!" 
                rating={5}
                avatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
              />
              <ReviewCard 
                name="Michael Chen" 
                title="Master Tailor, Bespoke & Co." 
                review="The measurement tracking and order management features are game-changers. I can now handle 3x more customers without losing quality. Highly recommended!" 
                rating={5}
                avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              />
              <ReviewCard 
                name="Elena Rodriguez" 
                title="Independent Fashion Designer" 
                review="The inventory management and billing features have saved me countless hours. The reports help me understand my business better than ever before." 
                rating={5}
                avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
              />
              <ReviewCard 
                name="David Thompson" 
                title="Owner, Thompson's Tailoring" 
                review="As a traditional tailor, I was skeptical about digital tools. But StyleHub is so intuitive and has actually improved my craft. My customers love the appointment system!" 
                rating={5}
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-lg">Style Hub</span>
              <p className="text-sm text-gray-400 mt-1">© 2025 All Rights Reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#features" className="text-gray-400 hover:text-white transition duration-300">Features</a>
              <button className="text-gray-400 hover:text-white transition duration-300">Pricing</button>
              <button className="text-gray-400 hover:text-white transition duration-300">Support</button>
              <button className="text-gray-400 hover:text-white transition duration-300">Contact Us</button>
              <button className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</button>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white transition duration-300" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white transition duration-300" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white transition duration-300" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable components
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const StepCard = ({ number, title, description, icon }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <div className="relative mb-4">
      <div className="text-4xl font-extrabold text-blue-200">{number}</div>
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const ReviewCard = ({ name, title, review, rating, avatar }) => (
  <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-500">
    <div className="flex items-center mb-2">
      {[...Array(rating)].map((_, i) => (
        <span key={i} className="text-yellow-400 text-xl">⭐</span>
      ))}
    </div>
    <p className="italic text-gray-700 mb-4">"{review}"</p>
    <div className="font-semibold">{name}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </div>
);

export default Home;
