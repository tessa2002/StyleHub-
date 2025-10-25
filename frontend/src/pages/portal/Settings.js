import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaUser, FaLock, FaBell, FaShieldAlt, FaTrash, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    preferences: {
      preferredContact: 'email',
      measurementUnit: 'cm',
      language: 'en'
    }
  });

  // Password settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    orderUpdates: true,
    appointmentReminders: true,
    paymentAlerts: true,
    promotional: false,
    marketing: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    cookies: true
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/profile');
      const userData = response.data;
      
      // Safely set profile data with fallbacks
      setProfile({
        name: userData?.profile?.name || userData?.name || '',
        email: userData?.profile?.email || userData?.email || '',
        phone: userData?.profile?.phone || userData?.phone || '',
        address: userData?.profile?.address || userData?.address || '',
        dateOfBirth: userData?.profile?.dateOfBirth || userData?.dateOfBirth || '',
        preferences: {
          preferredContact: userData?.profile?.preferences?.preferredContact || 'email',
          measurementUnit: userData?.profile?.preferences?.measurementUnit || 'cm',
          language: userData?.profile?.preferences?.language || 'en'
        }
      });
      
      setNotifications(userData?.notifications || notifications);
      setPrivacy(userData?.privacy || privacy);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/api/portal/profile', profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await axios.put('/api/portal/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update password:', err);
      setError('Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      await axios.put('/api/portal/notifications/settings', notifications);
      setSuccess('Notification settings updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update notifications:', err);
      setError('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      setLoading(true);
      await axios.put('/api/portal/privacy', privacy);
      setSuccess('Privacy settings updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update privacy:', err);
      setError('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        try {
          setLoading(true);
          await axios.delete('/api/portal/account');
          alert('Account deleted successfully. You will be redirected to the login page.');
          window.location.href = '/login';
        } catch (err) {
          console.error('Failed to delete account:', err);
          setError('Failed to delete account. Please contact support.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt }
  ];

  return (
    <DashboardLayout>
      <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        {/* Settings Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="tab-icon" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert success">
            <FaSave /> {success}
          </div>
        )}
        {error && (
          <div className="alert error">
            <FaTrash /> {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="settings-panel">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading settings...</p>
            </div>
          )}
          
          {!loading && activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profile?.dateOfBirth || ''}
                      onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={profile?.address || ''}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    rows="3"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Contact Method</label>
                  <select
                    value={profile?.preferences?.preferredContact || 'email'}
                    onChange={(e) => setProfile({
                      ...profile, 
                      preferences: {...(profile?.preferences || {}), preferredContact: e.target.value}
                    })}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!loading && activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <form onSubmit={handlePasswordChange} className="settings-form">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!loading && activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="settings-form">
                <div className="settings-group">
                  <h3>Notification Channels</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      />
                      <span>SMS Notifications</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      />
                      <span>Push Notifications</span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Notification Types</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdates}
                        onChange={(e) => setNotifications({...notifications, orderUpdates: e.target.checked})}
                      />
                      <span>Order Updates</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.appointmentReminders}
                        onChange={(e) => setNotifications({...notifications, appointmentReminders: e.target.checked})}
                      />
                      <span>Appointment Reminders</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.paymentAlerts}
                        onChange={(e) => setNotifications({...notifications, paymentAlerts: e.target.checked})}
                      />
                      <span>Payment Alerts</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.promotional}
                        onChange={(e) => setNotifications({...notifications, promotional: e.target.checked})}
                      />
                      <span>Promotional Offers</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications.marketing}
                        onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                      />
                      <span>Marketing Communications</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={handleNotificationUpdate} className="btn primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Data</h2>
              
              <div className="settings-form">
                <div className="settings-group">
                  <h3>Profile Visibility</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="public"
                        checked={privacy.profileVisibility === 'public'}
                        onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                      />
                      <span>Public - Visible to other users</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="private"
                        checked={privacy.profileVisibility === 'private'}
                        onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                      />
                      <span>Private - Only visible to you</span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Data Sharing</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={privacy.dataSharing}
                        onChange={(e) => setPrivacy({...privacy, dataSharing: e.target.checked})}
                      />
                      <span>Allow data sharing for service improvement</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={privacy.analytics}
                        onChange={(e) => setPrivacy({...privacy, analytics: e.target.checked})}
                      />
                      <span>Analytics and usage tracking</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={privacy.cookies}
                        onChange={(e) => setPrivacy({...privacy, cookies: e.target.checked})}
                      />
                      <span>Accept cookies for better experience</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={handlePrivacyUpdate} className="btn primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-item">
                  <div className="danger-content">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button 
                    className="btn danger"
                    onClick={handleAccountDeletion}
                    disabled={loading}
                  >
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
