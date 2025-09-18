import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
            console.log('🔑 Token found:', token ? 'Yes' : 'No');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    console.log('🔍 Verifying token with backend...');
                    const response = await axios.get('http://localhost:5000/api/auth/verify');
                    console.log('✅ Token verified, user:', response.data.user);
                    setUser(response.data.user); // set user with role
                } catch (error) {
                    console.error('❌ Token verification failed:', error);
                    localStorage.removeItem('token');
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
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = response.data;

            console.log('✅ Login successful, setting token and user');
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            return { success: true, user }; // return user for role-based redirect
        } catch (err) {
            console.error('❌ Login failed:', err);
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // 5b. Google login (client gets Google profile, sends to backend)
    const loginWithGoogle = async (profile) => {
        try {
            setError('');
            const response = await axios.post('http://localhost:5000/api/auth/google', profile);
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
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            
            // After successful registration, automatically log in the user
            const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
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
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // 7. Context value
    const value = { user, login, loginWithGoogle, register, logout, error, loading };

    // 8. Render children only after loading check
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
