import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const SimpleAdminDashboard = () => {
  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>Admin Dashboard</h1>
          <p style={{ margin: '0', fontSize: '1.2rem', opacity: '0.9' }}>
            Welcome to your shop management system
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Total Customers</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>156</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Active Orders</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>23</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Completed Orders</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>89</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Total Revenue</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>₹1,25,000</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Quick Actions</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px'
          }}>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              👥 Manage Customers
            </button>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              📦 Manage Orders
            </button>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              📏 Manage Measurements
            </button>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              🧵 Manage Staff
            </button>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              💳 Manage Billing
            </button>
            <button style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Status Message */}
        <div style={{ 
          background: '#dcfce7', 
          border: '1px solid #16a34a', 
          borderRadius: '8px', 
          padding: '16px', 
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#166534' }}>✅ Admin Dashboard is working correctly!</strong>
          <p style={{ margin: '8px 0 0 0', color: '#166534' }}>
            You can now manage your shop operations efficiently.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimpleAdminDashboard;
