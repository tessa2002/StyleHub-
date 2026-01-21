import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Appointments.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import AppointmentBookingFlow from './AppointmentBookingFlow';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingFlow, setShowBookingFlow] = useState(true); // Default to booking flow as in screenshot
  
  // Available services
  const services = [
    { name: 'Bespoke Suit Fitting', duration: '45 Minutes', image: 'https://images.unsplash.com/photo-1594932224828-b4b05a832974?q=80&w=800&auto=format&fit=crop' },
    { name: 'Consultation', duration: '30 Minutes', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
    { name: 'Measurement', duration: '20 Minutes', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop' },
    { name: 'Alteration', duration: '30 Minutes', image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800&auto=format&fit=crop' },
    { name: 'Fabric Selection', duration: '30 Minutes', image: 'https://images.unsplash.com/photo-1528459840556-3de04baccdfa?q=80&w=800&auto=format&fit=crop' }
  ];

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/appointments');
      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('❌ Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="tailorflow-page-root">
      {/* Top Navigation Bar from Screenshot */}
      <header className="tailorflow-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/portal" className="brand-link">
              <div className="brand-logo-pink">
                <svg viewBox="0 0 24 24" fill="#ff4d8d" width="24" height="24">
                   <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                </svg>
              </div>
              <span className="brand-name">TailorFlow</span>
            </Link>
          </div>
          
          <nav className="header-nav">
            <Link to="/portal" className="nav-link">Dashboard</Link>
            <Link to="/portal/appointments" className="nav-link active">Appointments</Link>
            <Link to="/portal/tailors" className="nav-link">Tailors</Link>
          </nav>

          <div className="header-right">
            <div className="user-avatar-circle">
              <img src={user?.avatar || "https://i.pravatar.cc/150?u=sarah"} alt="User" />
            </div>
          </div>
        </div>
      </header>

      <main className="tailorflow-content">
        <AppointmentBookingFlow 
          onClose={() => setShowBookingFlow(false)}
          onSuccess={() => {
            fetchAppointments();
            toast.success('Appointment booked successfully!');
          }}
          services={services}
        />
      </main>
    </div>
  );
};

export default Appointments;
