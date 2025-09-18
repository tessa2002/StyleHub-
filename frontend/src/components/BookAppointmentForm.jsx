import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

const BookAppointmentForm = () => {
  const [formData, setFormData] = useState({
    service: '',
    datetime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service || !formData.datetime) {
      toast.error('Service and Date & Time are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        service: formData.service,
        scheduledAt: new Date(formData.datetime).toISOString(),
        notes: formData.notes
      };
      const response = await axios.post('/api/appointments', payload);
      toast.success('Appointment booked successfully!');
      setFormData({ service: '', datetime: '', notes: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save appointment. Please try again.';
      toast.error(`Failed to save appointment: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-appointment-form">
      <div>
        <label>Service<span style={{color:'red'}}>*</span></label>
        <select name="service" value={formData.service} onChange={handleChange} required>
          <option value="">Select service</option>
          {services.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Date & Time<span style={{color:'red'}}>*</span></label>
        <input
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special requirements or notes..."
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default BookAppointmentForm;
