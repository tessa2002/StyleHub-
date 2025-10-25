import React from 'react';
import { useAuth } from '../../context/AuthContext';

const TailorTest = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Tailor Dashboard Test</h1>
      <p>Current User: {user?.name}</p>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Available Routes:</h2>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>/dashboard/tailor - Tailor Dashboard</li>
          <li>/dashboard/staff - Staff Dashboard</li>
          <li>/dashboard/customer - Customer Dashboard</li>
          <li>/dashboard/admin - Admin Dashboard</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Features Implemented:</h2>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>✅ Dashboard with quick stats (Orders Assigned, In Progress, Completed, Pending Delivery)</li>
          <li>✅ Today's Tasks list</li>
          <li>✅ Notifications Panel</li>
          <li>✅ Assigned Orders with status updates</li>
          <li>✅ Order filtering by status</li>
          <li>✅ Measurements access for assigned orders</li>
          <li>✅ Calendar view with upcoming deadlines</li>
          <li>✅ Communication & Notes system</li>
          <li>✅ Profile & Settings</li>
          <li>✅ Responsive sidebar navigation</li>
        </ul>
      </div>
    </div>
  );
};

export default TailorTest;




















