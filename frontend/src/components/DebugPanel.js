import React, { useState } from 'react';
import axios from 'axios';

const DebugPanel = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results = [];

    // Test 1: Basic server connection
    try {
      const response = await axios.get('http://localhost:5000/');
      results.push({
        test: 'Backend Server',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Backend Server',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 2: Auth verify endpoint
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:5000/api/auth/verify');
        results.push({
          test: 'Auth Verify',
          status: '✅ SUCCESS',
          data: response.data,
          error: null
        });
      } else {
        results.push({
          test: 'Auth Verify',
          status: '⚠️ NO TOKEN',
          data: null,
          error: 'No token found in localStorage'
        });
      }
    } catch (error) {
      results.push({
        test: 'Auth Verify',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 3: Portal profile endpoint (with proxy)
    try {
      const response = await axios.get('/api/portal/profile');
      results.push({
        test: 'Portal Profile (Proxy)',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Portal Profile (Proxy)',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 4: Portal appointments endpoint (with proxy)
    try {
      const response = await axios.get('/api/portal/appointments');
      results.push({
        test: 'Portal Appointments (Proxy)',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Portal Appointments (Proxy)',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 5: Test appointment creation
    try {
      const testAppointment = {
        service: 'Test Consultation',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: 'Test appointment'
      };
      const response = await axios.post('/api/portal/appointments', testAppointment);
      results.push({
        test: 'Create Appointment',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Create Appointment',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      maxHeight: '80vh', 
      overflow: 'auto',
      background: 'white',
      border: '2px solid #4f46e5',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>🔧 Debug Panel</h3>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px 16px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>

      <div style={{ fontSize: '12px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '4px',
            backgroundColor: result.status.includes('✅') ? '#f0f9ff' : 
                           result.status.includes('⚠️') ? '#fef3c7' : '#fee2e2',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {result.status} {result.test}
            </div>
            {result.data && (
              <div style={{ color: '#666', marginBottom: '4px' }}>
                Data: {JSON.stringify(result.data, null, 2).substring(0, 100)}...
              </div>
            )}
            {result.error && (
              <div style={{ color: '#dc2626' }}>
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
        <div><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
        <div><strong>Headers:</strong> {JSON.stringify(axios.defaults.headers.common, null, 2)}</div>
      </div>
    </div>
  );
};

export default DebugPanel;


