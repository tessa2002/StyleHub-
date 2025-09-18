import React, { useState } from 'react';
import axios from 'axios';

const ApiTest = () => {
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
        test: 'Basic Server Connection',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Basic Server Connection',
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
          test: 'Auth Verify Endpoint',
          status: '✅ SUCCESS',
          data: response.data,
          error: null
        });
      } else {
        results.push({
          test: 'Auth Verify Endpoint',
          status: '⚠️ NO TOKEN',
          data: null,
          error: 'No token found in localStorage'
        });
      }
    } catch (error) {
      results.push({
        test: 'Auth Verify Endpoint',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 3: Portal profile endpoint
    try {
      const response = await axios.get('/api/portal/profile');
      results.push({
        test: 'Portal Profile Endpoint (with proxy)',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Portal Profile Endpoint (with proxy)',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    // Test 4: Portal profile endpoint (direct)
    try {
      const response = await axios.get('http://localhost:5000/api/portal/profile');
      results.push({
        test: 'Portal Profile Endpoint (direct)',
        status: '✅ SUCCESS',
        data: response.data,
        error: null
      });
    } catch (error) {
      results.push({
        test: 'Portal Profile Endpoint (direct)',
        status: '❌ FAILED',
        data: null,
        error: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Connection Test</h2>
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>

      <div>
        <h3>Test Results:</h3>
        {testResults.map((result, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: result.status.includes('✅') ? '#f0f9ff' : 
                           result.status.includes('⚠️') ? '#fef3c7' : '#fee2e2'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {result.status} {result.test}
            </div>
            {result.data && (
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                Data: {JSON.stringify(result.data, null, 2)}
              </div>
            )}
            {result.error && (
              <div style={{ fontSize: '12px', color: '#dc2626' }}>
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '5px' }}>
        <h4>Debug Information:</h4>
        <p><strong>Token in localStorage:</strong> {localStorage.getItem('token') ? 'Present' : 'Not found'}</p>
        <p><strong>Axios default headers:</strong> {JSON.stringify(axios.defaults.headers.common, null, 2)}</p>
        <p><strong>Current URL:</strong> {window.location.href}</p>
      </div>
    </div>
  );
};

export default ApiTest;


