import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaUser, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaDownload, FaPrint, FaUserTie, FaBell, FaArrowUp, FaArrowDown,
  FaEllipsisH, FaChevronLeft, FaChevronRight, FaShoppingBag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Appointments.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showOrderActionsModal, setShowOrderActionsModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    scheduledAt: '',
    notes: ''
  });
  const [tailors, setTailors] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchTailors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/appointments');
      const appointmentsData = response.data.appointments || [];
      console.log('Fetched appointments:', appointmentsData);
      setAppointments(appointmentsData);
      
      // Set calendar to first appointment's month if appointments exist
      if (appointmentsData.length > 0) {
        const firstAppointmentDate = new Date(appointmentsData[0].scheduledAt || appointmentsData[0].requestedTime);
        if (!isNaN(firstAppointmentDate.getTime())) {
          setCurrentDate(firstAppointmentDate);
          setSelectedDate(firstAppointmentDate);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTailors = async () => {
    try {
      const response = await axios.get('/api/admin/staff');
      const tailorList = response.data.staff?.filter(s => s.role === 'Tailor') || [];
      setTailors(tailorList);
    } catch (error) {
      console.error('Error fetching tailors:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      // Handle different possible date fields and formats
      const aptDate = new Date(apt.scheduledAt || apt.requestedTime || apt.createdAt);
      
      // Check if the date is valid
      if (isNaN(aptDate.getTime())) {
        console.warn('Invalid appointment date:', apt);
        return false;
      }
      
      const result = isSameDay(aptDate, date);
      if (result) {
        console.log('Found appointment for date:', date.toDateString(), apt);
      }
      return result;
    });
  };

  const getTodaysAppointments = () => {
    const today = new Date();
    return getAppointmentsForDate(today);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDate = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Get months that have appointments
  const getMonthsWithAppointments = () => {
    const monthsWithAppointments = new Set();
    appointments.forEach(apt => {
      const aptDate = new Date(apt.scheduledAt || apt.requestedTime);
      if (!isNaN(aptDate.getTime())) {
        const monthKey = `${aptDate.getFullYear()}-${aptDate.getMonth()}`;
        monthsWithAppointments.add(monthKey);
      }
    });
    return Array.from(monthsWithAppointments).sort();
  };

  const jumpToNextAppointmentMonth = () => {
    const monthsWithAppointments = getMonthsWithAppointments();
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const currentIndex = monthsWithAppointments.indexOf(currentMonthKey);
    
    if (currentIndex < monthsWithAppointments.length - 1) {
      const nextMonthKey = monthsWithAppointments[currentIndex + 1];
      const [year, month] = nextMonthKey.split('-').map(Number);
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const jumpToPrevAppointmentMonth = () => {
    const monthsWithAppointments = getMonthsWithAppointments();
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const currentIndex = monthsWithAppointments.indexOf(currentMonthKey);
    
    if (currentIndex > 0) {
      const prevMonthKey = monthsWithAppointments[currentIndex - 1];
      const [year, month] = prevMonthKey.split('-').map(Number);
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isSelected = isSameDay(date, selectedDate);
      const isTodayDate = isToday(date);

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
          onClick={() => selectDate(day)}
        >
          <span className="day-number">{day}</span>
          {dayAppointments.length > 0 && (
            <div className="appointment-indicators">
              {dayAppointments.slice(0, 3).map((apt, index) => (
                <div 
                  key={index} 
                  className={`appointment-dot ${apt.status.toLowerCase()}`}
                  title={`${apt.customer?.name} - ${apt.service}`}
                ></div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="more-appointments">+{dayAppointments.length - 3}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleApprove = (appointment) => {
    setSelectedAppointment(appointment);
    setApprovalData({
      scheduledAt: formatDateTimeLocal(appointment.scheduledAt),
      notes: ''
    });
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    try {
      const response = await axios.put(
        `/api/admin/appointments/${selectedAppointment._id}/approve`,
        approvalData
      );
      
      toast.success('Appointment approved successfully!');
      setShowApprovalModal(false);
      
      // If appointment has related order, show order actions modal
      if (selectedAppointment.relatedOrder) {
        setShowOrderActionsModal(true);
      } else {
        setSelectedAppointment(null);
      }
      
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Failed to approve appointment');
    }
  };

  const handleCreateBill = async () => {
    if (!selectedAppointment?.relatedOrder) {
      toast.error('No order linked to this appointment');
      return;
    }

    try {
      const orderId = selectedAppointment.relatedOrder._id || selectedAppointment.relatedOrder;
      const response = await axios.post(`/api/admin/orders/${orderId}/create-bill`);
      
      toast.success('Bill created successfully!');
      console.log('Bill created:', response.data);
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error(error.response?.data?.message || 'Failed to create bill');
    }
  };

  const handleAssignTailor = async () => {
    if (!selectedTailor) {
      toast.error('Please select a tailor');
      return;
    }

    if (!selectedAppointment?.relatedOrder) {
      toast.error('No order linked to this appointment');
      return;
    }

    try {
      const orderId = selectedAppointment.relatedOrder._id || selectedAppointment.relatedOrder;
      const response = await axios.put(`/api/admin/orders/${orderId}/assign-tailor`, {
        tailorId: selectedTailor
      });
      
      toast.success('Order assigned to tailor successfully!');
      console.log('Order assigned:', response.data);
      
      // Close modal and reset
      setShowOrderActionsModal(false);
      setSelectedAppointment(null);
      setSelectedTailor('');
    } catch (error) {
      console.error('Error assigning tailor:', error);
      toast.error(error.response?.data?.message || 'Failed to assign tailor');
    }
  };

  const handleCompleteOrderActions = async () => {
    try {
      // Create bill first
      await handleCreateBill();
      
      // Then assign to tailor
      await handleAssignTailor();
      
    } catch (error) {
      console.error('Error completing order actions:', error);
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled
    
    try {
      await axios.put(`/api/admin/appointments/${appointmentId}/reject`, { reason });
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    }
  };

  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (appointment) => {
    const status = appointment.status;
    let className = 'status-badge ';
    
    switch (status) {
      case 'Pending':
        className += 'status-pending';
        break;
      case 'Scheduled':
        className += 'status-scheduled';
        break;
      case 'Completed':
        className += 'status-completed';
        break;
      case 'Cancelled':
        className += 'status-cancelled';
        break;
      default:
        className += 'status-default';
    }
    
    return <span className={className}>{status}</span>;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="stitchmaster-appointments loading">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="stitchmaster-appointments">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">SM</div>
            <div className="logo-text">
              <h3>StitchMaster</h3>
              <p>Tailoring Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Orders</span>
          </Link>
          <Link to="/admin/appointments" className="nav-item active">
            <div className="nav-icon-wrapper">
              <FaCalendarAlt className="nav-icon" />
            </div>
            <span>Appointments</span>
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaUser className="nav-icon" />
            </div>
            <span>Clients</span>
          </Link>
          <Link to="/admin/inventory" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Inventory</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="support-btn">
            <FaBell />
            Support Center
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Appointment Calendar</h1>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search appointments..."
              />
            </div>
            <button className="notification-btn">
              <FaBell />
            </button>
            <div className="user-profile">
              <div className="user-avatar">A</div>
            </div>
            <button 
              className="new-appointment-btn"
              onClick={() => setShowNewAppointmentModal(true)}
            >
              <FaPlus />
              New Appointment
            </button>
          </div>
        </header>

        {/* Calendar and Schedule Layout */}
        <div className="calendar-layout">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div className="calendar-header">
              <div className="month-navigation">
                <button 
                  className="nav-btn"
                  onClick={() => navigateMonth(-1)}
                >
                  <FaChevronLeft />
                </button>
                <h2 className="month-title">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button 
                  className="nav-btn"
                  onClick={() => navigateMonth(1)}
                >
                  <FaChevronRight />
                </button>
              </div>
              <div className="calendar-actions">
                {getMonthsWithAppointments().length > 0 && (
                  <>
                    <button 
                      className="action-btn appointment-nav-btn"
                      onClick={jumpToPrevAppointmentMonth}
                      title="Previous month with appointments"
                    >
                      <FaChevronLeft />
                      Prev Appointments
                    </button>
                    <button 
                      className="action-btn appointment-nav-btn"
                      onClick={jumpToNextAppointmentMonth}
                      title="Next month with appointments"
                    >
                      Next Appointments
                      <FaChevronRight />
                    </button>
                  </>
                )}
                <button className="action-btn">
                  <FaPrint />
                  Print Daily Schedule
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-container">
              <div className="calendar-weekdays">
                {dayNames.map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-grid">
                {renderCalendarGrid()}
              </div>
            </div>

            {/* Availability Status */}
            <div className="availability-status">
              <h3>Availability Status</h3>
              <div className="status-indicators">
                <div className="status-item">
                  <div className="status-dot available"></div>
                  <span>Available</span>
                </div>
                <div className="status-item">
                  <div className="status-dot busy"></div>
                  <span>Busy</span>
                </div>
                <div className="status-item">
                  <div className="status-dot pending"></div>
                  <span>Pending</span>
                </div>
                <div className="status-item">
                  <div className="status-dot scheduled"></div>
                  <span>Scheduled</span>
                </div>
              </div>
              
              {/* Month Summary */}
              <div className="month-summary">
                <h4>This Month</h4>
                <p>{appointments.filter(apt => {
                  const aptDate = new Date(apt.scheduledAt || apt.requestedTime);
                  return aptDate.getMonth() === currentDate.getMonth() && 
                         aptDate.getFullYear() === currentDate.getFullYear();
                }).length} appointments scheduled</p>
              </div>
            </div>
          </div>

          {/* Today's Schedule Sidebar */}
          <div className="schedule-sidebar">
            <div className="schedule-header">
              <h3>
                {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : "Selected Date Schedule"}
              </h3>
              <span className="schedule-date">{formatDate(selectedDate)}</span>
            </div>

            <div className="schedule-content">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <div className="no-appointments">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No appointments scheduled for {isSameDay(selectedDate, new Date()) ? 'today' : 'this date'}</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {getAppointmentsForDate(selectedDate).map(appointment => (
                    <div key={appointment._id} className="appointment-item">
                      <div className="appointment-time">
                        {formatTime(new Date(appointment.scheduledAt || appointment.requestedTime))}
                      </div>
                      <div className="appointment-details">
                        <div className="customer-name">
                          {appointment.customer?.name || 'Unknown Customer'}
                        </div>
                        <div className="service-type">{appointment.service}</div>
                        <div className="appointment-status">
                          {getStatusBadge(appointment)}
                        </div>
                      </div>
                      {appointment.status === 'Pending' && (
                        <div className="appointment-actions">
                          <button 
                            className="approve-btn"
                            onClick={() => handleApprove(appointment)}
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleReject(appointment._id)}
                            title="Reject"
                          >
                            <FaExclamationTriangle />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Approve Appointment</h2>
                <button className="close-btn" onClick={() => setShowApprovalModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <p><strong>Customer:</strong> {selectedAppointment.customer?.name}</p>
                <p><strong>Service:</strong> {selectedAppointment.service}</p>
                <p><strong>Requested Time:</strong> {formatDateTime(selectedAppointment.requestedTime || selectedAppointment.scheduledAt)}</p>
                
                <div className="form-group">
                  <label>Appointment Time:</label>
                  <input 
                    type="datetime-local"
                    value={approvalData.scheduledAt}
                    onChange={(e) => setApprovalData({...approvalData, scheduledAt: e.target.value})}
                  />
                  <small className="help-text">Modify the time if needed, or keep the requested time</small>
                </div>

                <div className="form-group">
                  <label>Admin Notes (optional):</label>
                  <textarea
                    rows="3"
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                    placeholder="Add any notes for the customer..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmApproval}>
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Actions Modal */}
        {showOrderActionsModal && selectedAppointment?.relatedOrder && (
          <div className="modal-overlay" onClick={() => {
            setShowOrderActionsModal(false);
            setSelectedAppointment(null);
            setSelectedTailor('');
          }}>
            <div className="modal-content order-actions-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📦 Complete Order Setup</h2>
                <button className="close-btn" onClick={() => {
                  setShowOrderActionsModal(false);
                  setSelectedAppointment(null);
                  setSelectedTailor('');
                }}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  <p>Appointment approved successfully!</p>
                </div>

                <div className="order-summary">
                  <h3>Order Details</h3>
                  <div className="summary-row">
                    <span>Item:</span>
                    <strong>{selectedAppointment.relatedOrder.itemType}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Amount:</span>
                    <strong>₹{selectedAppointment.relatedOrder.totalAmount}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Status:</span>
                    <span className="order-status">{selectedAppointment.relatedOrder.status}</span>
                  </div>
                  {selectedAppointment.relatedOrder.fabric?.source === 'customer' && (
                    <div className="fabric-alert">
                      🧵 <strong>Customer's Own Fabric</strong> - Customer will bring fabric to appointment
                    </div>
                  )}
                </div>

                <div className="action-section">
                  <h3>Next Steps</h3>
                  <p className="action-description">Complete the order setup by creating a bill and assigning it to a tailor.</p>
                  
                  <div className="form-group">
                    <label>1. Create Bill</label>
                    <button 
                      className="btn-action btn-bill"
                      onClick={handleCreateBill}
                    >
                      💳 Create Bill (₹{selectedAppointment.relatedOrder.totalAmount})
                    </button>
                    <small className="help-text">Generate invoice for the customer</small>
                  </div>

                  <div className="form-group">
                    <label>2. Assign to Tailor</label>
                    <select 
                      value={selectedTailor}
                      onChange={(e) => setSelectedTailor(e.target.value)}
                      className="tailor-select"
                    >
                      <option value="">Select a tailor...</option>
                      {tailors.map(tailor => (
                        <option key={tailor._id} value={tailor._id}>
                          {tailor.name} {tailor.email && `(${tailor.email})`}
                        </option>
                      ))}
                    </select>
                    <small className="help-text">Assign the order to an available tailor</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowOrderActionsModal(false);
                    setSelectedAppointment(null);
                    setSelectedTailor('');
                  }}
                >
                  Skip for Now
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleCompleteOrderActions}
                  disabled={!selectedTailor}
                >
                  Complete Both Actions
                </button>
                {selectedTailor && (
                  <button 
                    className="btn-assign"
                    onClick={handleAssignTailor}
                  >
                    Assign to Tailor Only
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Appointment Modal */}
        {showNewAppointmentModal && (
          <div className="modal-overlay" onClick={() => setShowNewAppointmentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Appointment</h2>
                <button className="close-btn" onClick={() => setShowNewAppointmentModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <p>New appointment creation form would go here...</p>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowNewAppointmentModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;

