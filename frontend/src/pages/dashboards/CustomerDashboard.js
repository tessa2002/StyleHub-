import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

import "./CustomerDashboard.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const [customer, setCustomer] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("🔍 Fetching profile data from /api/portal/profile");
        const { data: profile } = await axios.get("/api/portal/profile");
        console.log("✅ Profile data received:", profile);
        const u = profile.user || {};
        const c = profile.customer || {};
        
        setUserProfile(u);
        setCustomer({
          name: u.name || c.name || user?.name || "Guest",
          avatar: u.avatarUrl || "https://i.pravatar.cc/80",
          email: u.email || c.email || user?.email || "",
          phone: u.phone || c.phone || "",
          address: u.deliveryAddress || c.address || "",
          membership: c.membership || "Member",
          loyaltyPoints: c.loyaltyPoints || 0,
          registrationDate: u.createdAt || c.createdAt || "",
          customerId: u._id || c._id || "",
        });

        const { data: dash } = await axios.get("/api/portal/dashboard");
        setOrders((dash.recentOrders || []).map(mapOrder));
        setAppointments((dash.upcomingAppointments || []).map(mapAppt));
        setNotifications((dash.notifications || []).map(n => n.message));

        const { data: meas } = await axios.get("/api/portal/measurements");
        setMeasurements(meas.current || {});

        const { data: billRes } = await axios.get("/api/portal/bills", { params: { limit: 3 } });
        setPayments((billRes.bills || []).map(mapPayment));
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Check for missing profile fields
  const getMissingFields = () => {
    const missing = [];
    if (!customer.phone || customer.phone.trim() === '') missing.push('phone number');
    if (!customer.address || customer.address.trim() === '') missing.push('address');
    if (!userProfile.gender || userProfile.gender.trim() === '') missing.push('gender');
    if (!userProfile.dob) missing.push('date of birth');
    return missing;
  };

  const missingFields = getMissingFields();
  const isProfileComplete = missingFields.length === 0;

  // Analytics / Overview Cards
  const totalOrders = orders.length;
  const upcomingAppts = appointments.length;
  const totalPayments = payments.reduce((acc, p) => acc + parseFloat(p.amount.replace("₹", "")), 0);
  const loyaltyPoints = customer.loyaltyPoints || 0;

  return (
    <DashboardLayout title="Customer Dashboard">
      {/* Temporary Debug Panel - Remove after fixing issues */}
     
      
      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          {/* Profile Summary */}
          <section className="profile-summary card">
            <div className="profile-header">
              <img src={customer.avatar || "https://i.pravatar.cc/80"} alt="avatar" className="avatar" />
              <div className="profile-info">
                <h2>Welcome, {customer.name || "Guest"}</h2>
                <p className="profile-email">{customer.email || "example@email.com"}</p>
                <p className="profile-membership">Membership: {customer.membership || "Member"}</p>
                <p className="profile-loyalty">Loyalty Points: {loyaltyPoints}</p>
              </div>
              <div className="profile-actions">
                <Link to="/portal/profile" className="btn btn-primary">Edit Profile</Link>
              </div>
            </div>
            
            {/* Personal Details */}
            <div className="personal-details">
              <h3>Personal Information</h3>
              
              {/* Contact Information Section */}
              <div className="info-section">
                <h4 className="section-subtitle">
                  <span className="section-icon">📞</span>
                  Contact Information
                </h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span className="detail-value">
                      {customer.name || "Not provided"}
                      {customer.name && <span className="status-badge complete">✓</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email Address</label>
                    <span className="detail-value">
                      {customer.email || "Not provided"}
                      {customer.email && <span className="status-badge complete">✓</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number</label>
                    <span className="detail-value">
                      {customer.phone ? (
                        <>
                          {customer.phone}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>WhatsApp Number</label>
                    <span className="detail-value">
                      {userProfile.whatsapp ? (
                        <>
                          {userProfile.whatsapp}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="info-section">
                <h4 className="section-subtitle">
                  <span className="section-icon">📍</span>
                  Address Information
                </h4>
                <div className="details-grid">
                  <div className="detail-item full-width">
                    <label>Delivery Address</label>
                    <span className="detail-value">
                      {customer.address ? (
                        <>
                          {customer.address}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Billing Address</label>
                    <span className="detail-value">
                      {userProfile.billingAddress ? (
                        <>
                          {userProfile.billingAddress}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="info-section">
                <h4 className="section-subtitle">
                  <span className="section-icon">👤</span>
                  Account Information
                </h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Customer ID</label>
                    <span className="detail-value">
                      {customer.customerId || "Not available"}
                      {customer.customerId && <span className="status-badge complete">✓</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Registration Date</label>
                    <span className="detail-value">
                      {customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString() : "Not available"}
                      {customer.registrationDate && <span className="status-badge complete">✓</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <span className="detail-value">
                      {userProfile.gender ? (
                        <>
                          {userProfile.gender}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span className="detail-value">
                      {userProfile.dob ? (
                        <>
                          {new Date(userProfile.dob).toLocaleDateString()}
                          <span className="status-badge complete">✓</span>
                        </>
                      ) : (
                        <span className="missing-field">
                          <span className="status-badge incomplete">⚠</span>
                          Not Provided
                          <Link to="/portal/profile" className="add-link">Add Now</Link>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Profile Completion Alert */}
              {!isProfileComplete && (
                <div className="profile-completion-alert">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <h4>Complete Your Profile</h4>
                    <p>Please add your {missingFields.join(', ')} to complete your profile.</p>
                    <Link to="/portal/profile" className="btn btn-secondary">Complete Profile</Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Analytics / Quick Stats */}
          <section className="analytics-grid">
            <div className="card stat">
              <h3>Total Orders</h3>
              <p>{totalOrders}</p>
            </div>
            <div className="card stat">
              <h3>Upcoming Appointments</h3>
              <p>{upcomingAppts}</p>
            </div>
            <div className="card stat">
              <h3>Total Payments</h3>
              <p>₹{totalPayments}</p>
            </div>
            <div className="card stat">
              <h3>Loyalty Points</h3>
              <p>{loyaltyPoints}</p>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <Link to="/portal/orders/new" className="btn primary">New Order</Link>
            <Link to="/portal/appointments" className="btn secondary">Manage Appointments</Link>
            <Link to="/portal/measurements" className="btn secondary">Update Measurements</Link>
          </section>

          {/* Recent Orders */}
          <Section title="Recent Orders" link="/portal/orders" linkText="View All" items={orders} columns={["id", "item", "date", "status", "payment"]} />

          {/* Upcoming Appointments */}
          <Section title="Appointments" link="/portal/appointments" linkText="Manage" items={appointments} columns={["date", "time", "staff", "status"]} />

          {/* Measurements */}
          <section className="section card">
            <h3>Measurements</h3>
            <div className="grid">
              {Object.keys(measurements).length > 0 ? Object.entries(measurements).map(([key, val]) => (
                <div key={key}><strong>{key.toUpperCase()}:</strong> {val}</div>
              )) : <div className="empty">No measurements available</div>}
            </div>
            <Link to="/portal/measurements" className="primary btn">Update Measurements</Link>
          </section>

          {/* Bills & Payments */}
          <Section title="Invoices & Payments" link="/portal/payments" linkText="View All" items={payments} columns={["id", "order", "date", "amount", "status"]} />

          {/* Notifications */}
          <section className="section card">
            <h3>Notifications</h3>
            <ul>
              {notifications.length > 0 ? notifications.map((n, idx) => <li key={idx}>{n}</li>) : <li className="empty">No notifications yet</li>}
            </ul>
          </section>

          {/* Support */}
          <section className="section support card">
            <h3>Need Help?</h3>
            <p><Link to="/portal/support">Contact Support</Link> or message us on <a href="https://wa.me/919876543210">WhatsApp</a>.</p>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

// Mapping functions
function mapOrder(o) {
  return {
    id: o._id,
    item: o.itemType || '-',
    date: new Date(o.createdAt).toLocaleDateString(),
    status: o.status || '-',
    payment: `₹${o.totalAmount || 0}`,
  };
}

function mapAppt(a) {
  const d = new Date(a.scheduledAt);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    staff: a.staffName || '-',
    status: a.status || '-',
  };
}

function mapPayment(p) {
  return {
    id: p._id,
    order: p.orderId,
    date: new Date(p.createdAt).toLocaleDateString(),
    amount: `₹${p.amount || 0}`,
    status: p.status || '-',
  };
}

// Section Component
function Section({ title, link, linkText, items, columns }) {
  return (
    <section className="section card">
      <div className="section-header">
        <h3>{title}</h3>
        {link && <Link to={link} className="primary btn">{linkText}</Link>}
      </div>
      {items.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>{columns.map(col => <th key={col}>{col.toUpperCase()}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col}>{item[col]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty">No {title.toLowerCase()} found</div>
      )}
    </section>
  );
}
