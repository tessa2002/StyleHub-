import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaEdit, FaArrowRight } from 'react-icons/fa';
import './AppointmentBookingFlow.css';

const AppointmentBookingFlow = ({ editingAppointment, onClose, onSuccess, services }) => {
  const [step, setStep] = useState(0); // 0: Service Selection, 1: Time Selection
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [selectedTime, setSelectedTime] = useState('09:30 AM');
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // Current month
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(services[0]);

  const timeSlots = [
    { time: '09:30 AM', available: true },
    { time: '10:45 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '01:00 PM', available: true },
    { time: '02:15 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:30 PM', available: true },
    { time: '05:15 PM', available: false }
  ];

  // Calendar logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const days = [];
  // Previous month days
  const prevMonthDays = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, currentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true });
  }
  // Next month days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, currentMonth: false });
  }

  const isPastDate = (day, month, year) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(year, month, day);
    return dateToCheck < today;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Simple time conversion for the API (assuming 24h format needed or specific format)
      // For now, let's just use the current date logic from the previous form
      
      const [time, modifier] = selectedTime.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

      const appointmentData = {
        service: selectedService.name,
        scheduledAt: scheduledAt.toISOString(),
        notes: `Booked via new flow`
      };

      if (editingAppointment) {
        await axios.put(`/api/portal/appointments/${editingAppointment._id}/reschedule`, {
          scheduledAt: scheduledAt.toISOString()
        });
        toast.success('Appointment rescheduled successfully!');
      } else {
        await axios.post('/api/portal/appointments', appointmentData);
        toast.success('Appointment booked successfully!');
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to book appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-flow-container">
      {/* Breadcrumbs */}
      <nav className="booking-breadcrumbs">
        <span 
          className={`breadcrumb-item ${step === 0 ? 'active' : ''}`}
          onClick={() => setStep(0)}
          style={{ cursor: 'pointer' }}
        >
          Services
        </span>
        <span className="breadcrumb-separator">›</span>
        <span 
          className={`breadcrumb-item ${step === 1 ? 'active' : ''}`}
          onClick={() => step > 0 && setStep(1)}
          style={{ cursor: step > 0 ? 'pointer' : 'default' }}
        >
          Time Selection
        </span>
      </nav>

      {step === 0 ? (
        <div className="services-selection-grid">
          <section className="booking-section">
            <h2 className="section-title">Select Service</h2>
            <p className="section-subtitle">Choose the purpose of your appointment.</p>
            
            <div className="services-list">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className={`service-option-card ${selectedService.name === service.name ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="service-option-image">
                    <img src={service.image} alt={service.name} />
                  </div>
                  <div className="service-option-info">
                    <h3>{service.name}</h3>
                    <p>{service.duration}</p>
                  </div>
                  <div className="service-selection-indicator">
                    {selectedService.name === service.name && <div className="selected-dot"></div>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="selection-actions">
              <button 
                className="confirm-btn" 
                onClick={() => setStep(1)}
              >
                Continue to Schedule <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="booking-content-grid">
          {/* Left Column: Selection & Preparation */}
          <div className="booking-left-col">
            <section className="booking-section">
              <h2 className="section-title">Your Selection</h2>
              <p className="section-subtitle">Review your chosen fitting service details.</p>
              
              <div className="selection-card">
                <div className="selection-image-container">
                  <img src={selectedService.image} alt={selectedService.name} className="selection-image" />
                </div>
                <div className="selection-details">
                  <div className="selection-header">
                    <div>
                      <span className="service-badge">PREMIUM SERVICE</span>
                      <h3 className="service-name">{selectedService.name}</h3>
                    </div>
                    <button className="edit-selection-btn" onClick={() => setStep(0)}><FaEdit /></button>
                  </div>
                  <div className="service-info-row">
                    <span className="info-label">🕒 Duration</span>
                    <span className="info-value">{selectedService.duration}</span>
                  </div>
                </div>
              </div>
            </section>


          <section className="preparation-card">
            <div className="preparation-header">
              <FaInfoCircle className="info-icon" />
              <h3 className="preparation-title">Fitting Preparation</h3>
            </div>
            <ul className="preparation-list">
              <li>Wear light clothing for accurate measurements.</li>
              <li>Bring shoes you plan to wear with the suit.</li>
            </ul>
          </section>
        </div>

        {/* Right Column: Schedule */}
        <div className="booking-right-col">
          <section className="booking-section">
            <h2 className="section-title">Schedule</h2>
            <p className="section-subtitle">Select your preferred date and time slot.</p>

            <div className="calendar-card">
              <div className="calendar-header">
                <div>
                  <h3 className="current-month-year">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <span className="timezone-label">EASTERN STANDARD TIME</span>
                </div>
                <div className="calendar-nav">
                  <button onClick={handlePrevMonth} className="nav-btn"><FaChevronLeft /></button>
                  <button onClick={handleNextMonth} className="nav-btn"><FaChevronRight /></button>
                </div>
              </div>

              <div className="calendar-grid">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
                {days.map((d, i) => {
                  const isPast = isPastDate(d.day, currentMonth.getMonth(), currentMonth.getFullYear());
                  const isSelected = d.currentMonth && d.day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear();
                  
                  return (
                    <div 
                      key={i} 
                      className={`calendar-day ${!d.currentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${d.currentMonth && isPast ? 'disabled' : ''}`}
                      onClick={() => d.currentMonth && !isPast && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d.day))}
                    >
                      {d.day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="time-slots-section">
              <div className="time-slots-header">
                <div className="header-left">
                  <span className="clock-icon">⏰</span>
                  <h3 className="time-slots-title">
                    Available Times for {monthNames[selectedDate.getMonth()].slice(0, 3)} {selectedDate.getDate()}
                  </h3>
                </div>
                <span className="slots-count">{timeSlots.length} SLOTS</span>
              </div>

              <div className="time-slots-grid">
                {timeSlots.map(slot => (
                  <button 
                    key={slot.time}
                    className={`time-slot-btn ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <div className="confirmation-bar">
              <div className="confirmation-info">
                <span className="confirming-label">CONFIRMING APPOINTMENT</span>
                <h4 className="confirmation-time">
                  {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()].slice(0, 3)} {selectedDate.getDate()} at {selectedTime}
                </h4>
              </div>
              <button 
                className="confirm-btn" 
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Appointment'} <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      </div>
    )}
      
      <div className="booking-footer">
        <p>© 2024 TailorFlow Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AppointmentBookingFlow;
