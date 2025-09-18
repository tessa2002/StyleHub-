import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import './Appointments.css';
import { toast } from 'react-toastify';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Available services
  const services = [
    'Fitting',
    'Consultation',
    'Measurement',
    'Design Discussion',
    'Fabric Selection',
    'Final Fitting',
    'Pickup',
    'Alteration'
  ];

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching appointments...');
      const response = await axios.get('/api/portal/appointments');
      console.log('✅ Appointments loaded:', response.data);
      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('❌ Failed to fetch appointments:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
        method: err.config?.method,
        data: err.response?.data
      });
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appointment => {
    const now = new Date();
    const appointmentDate = new Date(appointment.scheduledAt);
    
    switch (filter) {
      case 'upcoming':
        return appointment.status === 'Scheduled' && appointmentDate >= now;
      case 'past':
        return appointment.status === 'Completed' || (appointment.status === 'Scheduled' && appointmentDate < now);
      case 'cancelled':
        return appointment.status === 'Cancelled';
      default:
        return true;
    }
  });

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await axios.put(`/api/portal/appointments/${appointmentId}/cancel`);
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'Cancelled' }
            : apt
        )
      );
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  // Reschedule appointment
  const handleReschedule = (appointment) => {
    setEditingAppointment(appointment);
    setShowBookingForm(true);
  };

  // Format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  // Check if appointment is upcoming
  const isUpcoming = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.scheduledAt);
    return appointment.status === 'Scheduled' && appointmentDate >= now;
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="appointments-container">
        {/* Header with filters and book button */}
        <div className="appointments-header">
          <div className="appointments-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming ({appointments.filter(apt => isUpcoming(apt)).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past ({appointments.filter(apt => !isUpcoming(apt) && apt.status !== 'Cancelled').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled ({appointments.filter(apt => apt.status === 'Cancelled').length})
            </button>
          </div>
          
          <button 
            className="btn btn-primary book-btn"
            onClick={() => setShowBookingForm(true)}
          >
            <span className="btn-icon">+</span>
            Book Appointment
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading appointments...
          </div>
        ) : (
          <>
            {/* Appointments list */}
            {filteredAppointments.length > 0 ? (
              <div className="appointments-list">
                {filteredAppointments.map(appointment => {
                  const { date, time } = formatDateTime(appointment.scheduledAt);
                  const upcoming = isUpcoming(appointment);
                  
                  return (
                    <div 
                      key={appointment._id} 
                      className={`appointment-card ${upcoming ? 'upcoming' : ''} ${appointment.status.toLowerCase()}`}
                    >
                      <div className="appointment-header">
                        <div className="appointment-service">
                          <h3>{appointment.service}</h3>
                          <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        {upcoming && (
                          <div className="appointment-actions">
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              Reschedule
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(appointment._id)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="appointment-details">
                        <div className="detail-item">
                          <span className="detail-label">📅 Date:</span>
                          <span className="detail-value">{date}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">🕐 Time:</span>
                          <span className="detail-value">{time}</span>
                        </div>
                        {appointment.notes && (
                          <div className="detail-item">
                            <span className="detail-label">📝 Notes:</span>
                            <span className="detail-value">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No appointments found</h3>
                <p>
                  {filter === 'all' 
                    ? "You don't have any appointments yet. Book your first appointment to get started!"
                    : `No ${filter} appointments found.`
                  }
                </p>
                {filter === 'all' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowBookingForm(true)}
                  >
                    Book Your First Appointment
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Booking/Edit Form Modal */}
        {showBookingForm && (
          <BookingForm
            appointment={editingAppointment}
            services={services}
            onClose={() => {
              setShowBookingForm(false);
              setEditingAppointment(null);
            }}
            onSuccess={() => {
              fetchAppointments();
              setShowBookingForm(false);
              setEditingAppointment(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Booking/Edit Form Component
const BookingForm = ({ appointment, services, onClose, onSuccess }) => {
  // Helper to format a Date into local datetime-local value (YYYY-MM-DDTHH:mm)
  const toLocalInputValue = (dt) => {
    const d = new Date(dt);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    service: appointment?.service || '',
    scheduledAt: appointment?.scheduledAt ? toLocalInputValue(appointment.scheduledAt) : '',
    notes: appointment?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔍 Submitting appointment:', formData);
      
      // Validate required fields
      if (!formData.service) {
        setError('Please select a service');
        setLoading(false);
        return;
      }
      
      if (!formData.scheduledAt) {
        setError('Please select a date and time');
        setLoading(false);
        return;
      }
      
      // Validate date is at least 1 minute in the future
      const selectedDate = new Date(formData.scheduledAt);
      const now = new Date();
      const minFuture = new Date(now.getTime() + 60 * 1000); // 1 minute buffer
      if (selectedDate < minFuture) {
        setError('Please select a date and time at least 1 minute in the future');
        setLoading(false);
        return;
      }
      
      if (appointment) {
        // Reschedule existing appointment
        console.log('📅 Rescheduling appointment:', appointment._id);
        const response = await axios.put(`/api/portal/appointments/${appointment._id}/reschedule`, {
          scheduledAt: formData.scheduledAt
        });
        console.log('✅ Reschedule successful:', response.data);
        
        // Show success message
        toast.success('Appointment rescheduled successfully!');
      } else {
        // Create new appointment
        console.log('➕ Creating new appointment with data:', {
          service: formData.service,
          scheduledAt: formData.scheduledAt,
          notes: formData.notes
        });
        
        const response = await axios.post('/api/portal/appointments', {
          service: formData.service,
          scheduledAt: formData.scheduledAt,
          notes: formData.notes
        });
        console.log('✅ Booking successful:', response.data);
        
        // Show success message
        toast.success('Appointment booked successfully!');
      }
      
      onSuccess();
    } catch (err) {
      console.error('❌ Failed to save appointment:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
        method: err.config?.method,
        requestData: err.config?.data,
        responseData: err.response?.data
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save appointment. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid appointment data. Please check your inputs.';
      } else if (err.response?.status === 401) {
        errorMessage = 'You need to be logged in to book appointments.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Customer profile not found. Please complete your profile first.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointment ? 'Reschedule Appointment' : 'Book New Appointment'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="booking-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">❌</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="service" className="form-label">
              Service <span className="required">*</span>
            </label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="scheduledAt" className="form-label">
              Date & Time <span className="required">*</span>
            </label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleChange}
              className="form-input"
              required
              min={toLocalInputValue(new Date(Date.now() + 60 * 1000))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows={3}
              placeholder="Any special requirements or notes..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (appointment ? 'Reschedule' : 'Book Appointment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appointments;