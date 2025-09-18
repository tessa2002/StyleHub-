import React from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { FaCog, FaUser, FaBell, FaUserShield, FaDatabase } from 'react-icons/fa';

export default function Settings() {
  return (
    <AdminDashboardLayout title="Settings">
      <div className="settings-page">
        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-icon">
              <FaUser />
            </div>
            <h3>Profile Settings</h3>
            <p>Manage your admin profile and account preferences</p>
            <button className="btn btn-light">Configure</button>
          </div>

          <div className="settings-card">
            <div className="settings-icon">
              <FaBell />
            </div>
            <h3>Notifications</h3>
            <p>Configure email and system notification preferences</p>
            <button className="btn btn-light">Configure</button>
          </div>

          <div className="settings-card">
            <div className="settings-icon">
              <FaUserShield />
            </div>
            <h3>Security</h3>
            <p>Manage password, two-factor authentication, and security settings</p>
            <button className="btn btn-light">Configure</button>
          </div>

          <div className="settings-card">
            <div className="settings-icon">
              <FaDatabase />
            </div>
            <h3>System Settings</h3>
            <p>Configure system-wide settings and preferences</p>
            <button className="btn btn-light">Configure</button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Quick Settings</h3>
          <div className="quick-settings">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Enable email notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Show dashboard metrics
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                Enable debug mode
              </label>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          display: grid;
          gap: 24px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .settings-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
          text-align: center;
        }

        .settings-icon {
          width: 60px;
          height: 60px;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #4f46e5;
          font-size: 24px;
        }

        .settings-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .settings-card p {
          margin: 0 0 16px 0;
          color: #64748b;
          font-size: 14px;
        }

        .settings-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
        }

        .settings-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .quick-settings {
          display: grid;
          gap: 12px;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .setting-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .btn:hover {
          background: #f8fafc;
        }

        .btn-light {
          background: #f8fafc;
          color: #64748b;
        }
      `}</style>
    </AdminDashboardLayout>
  );
}
