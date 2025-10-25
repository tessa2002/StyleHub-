import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminTest = () => {
  return (
    <DashboardLayout>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Admin Test Page</h1>
        <p>If you can see this, the admin dashboard is working!</p>
        <div style={{ 
          background: '#f0f0f0', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3>Admin Dashboard Status: ✅ Working</h3>
          <p>You are successfully logged in as an admin.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTest;
