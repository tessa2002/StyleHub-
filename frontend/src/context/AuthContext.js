import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure API URL based on environment
// In production, if REACT_APP_API_URL is not set, use empty string (same domain)
// In development, use localhost:5000
const API_URL = process.env.REACT_APP_API_URL !== undefined 
  ? process.env.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// Ensure baseURL is set before any component effects run
axios.defaults.baseURL = API_URL;

// Add axios interceptor to always include token in requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors (token expired/invalid)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalid or expired
            console.warn('⚠️ Authentication error:', error.response?.data?.message);
            // Only redirect to login if not already on login/register page
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                window.location.href = '/login?expired=1';
            }
        }
        return Promise.reject(error);
    }
);

// 1. Create Auth Context
const AuthContext = createContext();

// 2. Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

// 3. AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);      // logged-in user data
    const [loading, setLoading] = useState(true); // initial auth check
    const [error, setError] = useState('');      // error messages

    // 4. Check token on app load
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            console.log('🔑 Token found:', token ? 'Yes' : 'No');
            console.log('👤 Stored user found:', storedUser ? 'Yes' : 'No');
            
            // Always set a baseURL so we don't rely on the dev proxy
            axios.defaults.baseURL = API_URL;
            console.log('🌐 API URL:', API_URL || 'Same domain');
            
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    console.log('🔍 Verifying token with backend...');
                    const response = await axios.get('/api/auth/verify');
                    console.log('✅ Token verified, user:', response.data.user);
                    setUser(response.data.user); // set user with role
                    // Update localStorage with fresh user data
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } catch (error) {
                    console.error('❌ Token verification failed:', error.response?.data || error.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    // 5. Login function
    const login = async (email, password) => {
        try {
            setError('');
            console.log('🔍 Attempting login for:', email);
            axios.defaults.baseURL = API_URL;
            const response = await axios.post('/api/auth/login', { email, password });
            
            console.log('📦 Full response data:', response.data);
            
            const { token, user } = response.data;

            // Validate response data
            if (!token || !user) {
                console.error('❌ Invalid response structure:', response.data);
                throw new Error('Invalid response from server');
            }

            if (!user.role) {
                console.error('❌ User object missing role:', user);
                throw new Error('User role not provided by server');
            }

            console.log('✅ Login successful, setting token and user', user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user)); // Also store user in localStorage
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Ensure user state is set before returning
            setUser(user);
            
            // Wait a tick to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 50));

            return { success: true, user }; // return user for role-based redirect
        } catch (err) {
            console.error('❌ Login failed:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // 5b. Google login (client gets Google profile, sends to backend)
    const loginWithGoogle = async (profile) => {
        try {
            setError('');
            axios.defaults.baseURL = API_URL;
            const response = await axios.post('/api/auth/google', profile);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Google login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // 5c. Register function with auto-login
    const register = async (userData) => {
        try {
            setError('');
            axios.defaults.baseURL = API_URL;
            const response = await axios.post('/api/auth/register', userData);
            
            // After successful registration, automatically log in the user
            const loginResponse = await axios.post('/api/auth/login', {
                email: userData.email,
                password: userData.password
            });
            
            const { token, user } = loginResponse.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            
            return { success: true, user, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // 6. Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // 7. Context value
    const value = { user, setUser, login, loginWithGoogle, register, logout, error, loading };

    // 8. Render children only after loading check
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
