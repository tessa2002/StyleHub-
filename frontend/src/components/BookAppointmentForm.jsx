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
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validations
    if (!formData.service) {
      toast.error('Please select a service.');
      return;
    }
    if (!formData.datetime) {
      toast.error('Please select date and time.');
      return;
    }
    const selectedDate = new Date(formData.datetime);
    if (isNaN(selectedDate.getTime())) {
      toast.error('Invalid date and time.');
      return;
    }
    if (selectedDate <= new Date()) {
      toast.error('Please select a future date and time.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        service: formData.service,
        scheduledAt: selectedDate.toISOString(),
        notes: formData.notes
      };
      const response = await axios.post('/api/portal/appointments', payload);
      toast.success('Appointment booked successfully!');
      setFormData({ service: '', datetime: '', notes: '' });
    } catch (err) {
      const msg = err.response?.data?.message
        ? `Failed to save appointment: ${err.response.data.message}`
        : 'Failed to save appointment. Please try again.';
      toast.error(msg);
      setError(msg);
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
          min={new Date().toISOString().slice(0,16)}
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
