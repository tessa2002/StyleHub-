import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaGem, 
  FaChevronRight, 
  FaMapMarkerAlt, 
  FaRegClock,
  FaRobot,
  FaPaperPlane
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import './CustomerDashboard.css';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: `Hello ${user?.name?.split(' ')[0] || 'there'}! Need help with measurements or fabric choices? I'm here to assist.` }
  ]);

  const handleSendAiMessage = () => {
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage.trim();
    setAiMessage('');
    
    const newHistoryWithUser = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistoryWithUser);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = "I've received your request. I'm analyzing your measurement history and current style trends to provide the best recommendation. How else can I help?";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('style') || lowerMsg.includes('look')) {
        response = "Based on your previous orders, you seem to prefer formal styles. Have you checked our new Italian silk collection?";
      } else if (lowerMsg.includes('fabric') || lowerMsg.includes('material')) {
        response = "For the current season, I recommend breathable linen or premium cotton. Would you like to see our fabric catalog?";
      } else if (lowerMsg.includes('measurement') || lowerMsg.includes('size')) {
        response = "Your last measurements were updated 2 months ago. Would you like to book a new fitting session to ensure perfect accuracy?";
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/portal/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Use real data from API or fallbacks to match the image mockup
  const orderNotification = data?.notifications?.find(n => n.type === 'order');
  const activeOrdersCount = orderNotification 
    ? parseInt(orderNotification.message.match(/\d+/)?.[0] || '0') 
    : 0;

  const loyaltyPoints = data?.loyalty?.points || 0;
  const loyaltyTier = data?.loyalty?.tier || "Basic Member";
  const pointsToNext = data?.loyalty?.pointsToNext || 0;

  const nextAppointment = data?.upcomingAppointments?.[0] || null;
  
  const getFittingDisplay = () => {
    if (!nextAppointment) return { main: "Not scheduled", sub: "Book an appointment" };
    
    const apptDate = new Date(nextAppointment.scheduledAt);
    const now = new Date();
    const diffTime = apptDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let main = "";
    if (diffDays === 0) main = "Today";
    else if (diffDays === 1) main = "Tomorrow";
    else if (diffDays > 1) main = `In ${diffDays} Days`;
    else main = "Past due";

    const timeStr = apptDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return { main, sub: `${timeStr} - ${nextAppointment.service}` };
  };

  const fittingInfo = getFittingDisplay();

  const recentOrders = data?.recentOrders || [];

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <DashboardLayout title="Dashboard" showTitle={false}>
      <div className="dashboard-page">
        {/* Header Breadcrumbs & Action */}
        <div className="dashboard-header-alt">
          <div className="breadcrumbs">Home / Dashboard</div>
          <div className="header-actions">
            <button className="notification-icon-btn">
              <FaRegClock />
              <span className="badge"></span>
            </button>
            <button className="btn-new-request" onClick={() => navigate('/portal/orders/new')}>+ New Request</button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Sarah'}</h1>
            <p>Your daughter's flower girl dress is ready for fitting.</p>
          </div>
          <div className="welcome-date">
            <span className="date-label">Today is</span>
            <span className="date-value">{today}</span>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-icon-container purple">
              <FaShoppingBag />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Active Orders</span>
              <span className="kpi-value">{activeOrdersCount}</span>
            </div>
            <div className="kpi-status in-progress">In Progress</div>
          </div>

          <div className="kpi-card loyalty">
            <div className="kpi-icon-container purple-alt">
              <FaGem />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">My Loyalty Points</span>
              <span className="kpi-value">{loyaltyPoints.toLocaleString()}</span>
              <div className="loyalty-progress-container">
                <div className="loyalty-progress-bar" style={{ width: '75%' }}></div>
              </div>
              <span className="loyalty-footer">{pointsToNext} pts to {loyaltyTier}</span>
            </div>
            <div className="kpi-status-badge">+{pointsToNext} pts</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container orange">
              <FaRegClock />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Next Fitting</span>
              <span className="kpi-value">{fittingInfo.main}</span>
              <span className="kpi-sublabel">{fittingInfo.sub}</span>
            </div>
            <div className="kpi-status upcoming">{nextAppointment ? 'Upcoming' : 'None'}</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* My Orders Section */}
          <div className="orders-section">
            <div className="section-header-alt">
              <h2>My Orders</h2>
              <button className="view-history-link">View Order History</button>
            </div>
            <div className="orders-table-container">
              <table className="orders-table-alt">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Garment Details</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id ? order._id.slice(-4) : 'N/A'}</td>
                      <td className="garment-cell">
                        <div className="garment-info">
                          <div className="garment-thumb"></div>
                          <div className="garment-text">
                            <span className="garment-name">{order.itemType || order.garment || 'Garment'}</span>
                            <span className="garment-subtext">{order.details || 'Standard fit'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || 'N/A')}</td>
                      <td>
                        <div className="status-container">
                          <span className={`status-text ${(order.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status || 'Pending'}
                          </span>
                          {order.progress > 0 && order.progress < 100 && (
                            <span className="progress-percent">{order.progress}%</span>
                          )}
                          {order.status === 'Ready for Pickup' && (
                             <span className="status-dot green"></span>
                          )}
                        </div>
                      </td>
                      <td>
                        {order.status === 'Embellishing' ? (
                          <button className="btn-track-order">
                            Track Order <FaChevronRight />
                          </button>
                        ) : (
                          <button className="btn-view-only">
                            <FaRegClock />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="dashboard-sidebar-area">
            {/* Upcoming Appointment Card */}
            <div className="appointment-card-alt">
              <h3>Upcoming Appointment</h3>
              {nextAppointment ? (
                <>
                  <div className="appointment-details">
                    <div className="appointment-date-box">
                      <span className="month">
                        {new Date(nextAppointment.scheduledAt).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="day">
                        {new Date(nextAppointment.scheduledAt).getDate()}
                      </span>
                    </div>
                    <div className="appointment-info">
                      <h4>{nextAppointment.service}</h4>
                      <p>{nextAppointment.garment || 'General Fitting'}</p>
                      <span className="time">
                        <FaRegClock /> {new Date(nextAppointment.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="staff-info">
                    <div className="staff-avatar"></div>
                    <div className="staff-text">
                      <span className="staff-name">{nextAppointment.tailor?.name || 'Senior Stylist'}</span>
                      <span className="staff-role">{nextAppointment.tailor?.role || 'Head Seamstress'}</span>
                    </div>
                  </div>
                  <div className="location-info">
                    <FaMapMarkerAlt />
                    <span>StyleHub Boutique & Atelier<br />123 Fashion Ave, NY</span>
                  </div>
                  <div className="appointment-actions">
                    <button className="btn-reschedule" onClick={() => navigate('/portal/appointments')}>Reschedule</button>
                    <button className="btn-directions">Directions</button>
                  </div>
                </>
              ) : (
                <div className="no-appointment-info">
                  <p>You have no upcoming appointments.</p>
                  <button 
                    className="btn-new-request" 
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={() => navigate('/portal/appointments')}
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistant Card */}
            <div className="ai-assistant-card">
              <div className="ai-header">
                <div className="ai-title">
                  <FaRobot />
                  <span>AI Assistant</span>
                </div>
                <span className="online-status">ONLINE</span>
              </div>
              <div className="ai-chat-history">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`ai-message-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="ai-input-container">
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()}
                />
                <button className="btn-send" onClick={handleSendAiMessage}><FaPaperPlane /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
