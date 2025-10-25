import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaQuestionCircle, FaTicketAlt, FaPhone, FaEnvelope, FaWhatsapp, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Support.css';

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchSupportInfo();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/support/tickets');
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportInfo = async () => {
    try {
      const response = await axios.get('/api/portal/support/info');
      setSupportInfo(response.data);
    } catch (err) {
      console.error('Error fetching support info:', err);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/portal/support/tickets', ticketForm);
      if (response.data.success) {
        alert('Support ticket created successfully!');
        setShowTicketForm(false);
        setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Failed to create support ticket. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return '🔓';
      case 'in_progress': return '⏳';
      case 'resolved': return '✅';
      case 'closed': return '🔒';
      default: return '❓';
    }
  };

  return (
    <DashboardLayout>
      <div className="support-page">
      <div className="page-header">
        <h1 className="page-title">Support & Help</h1>
        <p className="page-subtitle">Get help with your orders, appointments, and account</p>
      </div>

      <div className="support-content">
        {/* Quick Help Options */}
        <div className="help-options">
          <div className="help-card">
            <div className="help-icon">
              <FaQuestionCircle />
            </div>
            <div className="help-content">
              <h3>FAQ</h3>
              <p>Find answers to common questions</p>
              <button className="help-btn">View FAQ</button>
            </div>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <FaTicketAlt />
            </div>
            <div className="help-content">
              <h3>Create Ticket</h3>
              <p>Submit a support request</p>
              <button 
                className="help-btn primary"
                onClick={() => setShowTicketForm(true)}
              >
                New Ticket
              </button>
            </div>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <FaPhone />
            </div>
            <div className="help-content">
              <h3>Call Support</h3>
              <p>Speak with our support team</p>
              <button className="help-btn">+91-9876543210</button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info">
          <h2>Contact Information</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <FaPhone className="contact-icon" />
              <div className="contact-details">
                <h4>Phone Support</h4>
                <p>{supportInfo?.phone || '+91-9876543210'}</p>
                <span>{supportInfo?.phoneHours || 'Mon-Fri: 9 AM - 6 PM'}</span>
              </div>
            </div>

            <div className="contact-method">
              <FaEnvelope className="contact-icon" />
              <div className="contact-details">
                <h4>Email Support</h4>
                <p>{supportInfo?.email || 'support@stylehub.com'}</p>
                <span>{supportInfo?.emailResponse || 'Response within 24 hours'}</span>
              </div>
            </div>

            <div className="contact-method">
              <FaWhatsapp className="contact-icon" />
              <div className="contact-details">
                <h4>WhatsApp</h4>
                <p>{supportInfo?.whatsapp || '+91-9876543210'}</p>
                <span>{supportInfo?.whatsappResponse || 'Quick responses'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="support-tickets">
          <div className="tickets-header">
            <h2>My Support Tickets</h2>
            <button 
              className="btn primary"
              onClick={() => setShowTicketForm(true)}
            >
              <FaTicketAlt /> New Ticket
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading support tickets...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : tickets.length > 0 ? (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-item">
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <h4>{ticket.subject}</h4>
                      <div className="ticket-meta">
                        <span 
                          className="priority"
                          style={{ color: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span 
                          className="status"
                          style={{ color: getStatusColor(ticket.status) }}
                        >
                          {getStatusIcon(ticket.status)} {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="ticket-description">{ticket.description}</p>
                    <div className="ticket-footer">
                      <span className="ticket-date">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span className="ticket-id">#{ticket.ticketId}</span>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <button className="action-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaTicketAlt className="empty-icon" />
              <p>No support tickets found</p>
              <button 
                className="btn primary"
                onClick={() => setShowTicketForm(true)}
              >
                Create Your First Ticket
              </button>
            </div>
          )}
        </div>

        {/* Ticket Form Modal */}
        {showTicketForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create Support Ticket</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowTicketForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitTicket} className="ticket-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="order">Order Issues</option>
                      <option value="appointment">Appointment</option>
                      <option value="measurement">Measurements</option>
                      <option value="payment">Payment</option>
                      <option value="account">Account</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority</label>
                    <select 
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    placeholder="Please provide detailed information about your issue..."
                    rows="5"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn secondary"
                    onClick={() => setShowTicketForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn primary"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
