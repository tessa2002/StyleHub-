import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaSave, FaCog, FaUser, FaBell, FaLock, FaDatabase, FaPalette } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    shopName: 'Style Hub',
    shopAddress: '',
    shopPhone: '',
    shopEmail: '',
    
    // Business Settings
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    workingHours: '9:00 AM - 6:00 PM',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    paymentNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    requirePasswordChange: false,
    twoFactorAuth: false,
    
    // Display Settings
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30
  });

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      if (response.data.success) {
        setSettings({ ...settings, ...response.data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put('/api/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'business', label: 'Business', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'display', label: 'Display', icon: <FaPalette /> },
    { id: 'backup', label: 'Backup', icon: <FaDatabase /> }
  ];

  if (loading && Object.keys(settings).length === 0) {
    return (
      <DashboardLayout>
        <div className="settings-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="page-header">
          <h1>Admin Settings</h1>
          <p>Manage your shop configuration and preferences</p>
        </div>

        <div className="settings-container">
          {/* Settings Tabs */}
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h2>General Settings</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Shop Name</label>
                    <input
                      type="text"
                      value={settings.shopName}
                      onChange={(e) => handleChange('shopName', e.target.value)}
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Shop Address</label>
                    <textarea
                      value={settings.shopAddress}
                      onChange={(e) => handleChange('shopAddress', e.target.value)}
                      placeholder="Enter shop address"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={settings.shopPhone}
                      onChange={(e) => handleChange('shopPhone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={settings.shopEmail}
                      onChange={(e) => handleChange('shopEmail', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business Settings */}
            {activeTab === 'business' && (
              <div className="settings-section">
                <h2>Business Settings</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Working Hours</label>
                    <input
                      type="text"
                      value={settings.workingHours}
                      onChange={(e) => handleChange('workingHours', e.target.value)}
                      placeholder="e.g., 9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Settings</h2>
                <div className="form-grid">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                      />
                      <span>SMS Notifications</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.orderNotifications}
                        onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                      />
                      <span>Order Notifications</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.paymentNotifications}
                        onChange={(e) => handleChange('paymentNotifications', e.target.checked)}
                      />
                      <span>Payment Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security Settings</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.requirePasswordChange}
                        onChange={(e) => handleChange('requirePasswordChange', e.target.checked)}
                      />
                      <span>Require Password Change</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                      />
                      <span>Two-Factor Authentication</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="settings-section">
                <h2>Display Settings</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleChange('dateFormat', e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="settings-section">
                <h2>Backup Settings</h2>
                <div className="form-grid">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleChange('autoBackup', e.target.checked)}
                      />
                      <span>Automatic Backup</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Backup Frequency</label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Backup Retention (days)</label>
                    <input
                      type="number"
                      value={settings.backupRetention}
                      onChange={(e) => handleChange('backupRetention', parseInt(e.target.value))}
                      min="7"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="settings-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <FaSave />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
