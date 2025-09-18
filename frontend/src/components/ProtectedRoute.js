// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Map role to its dashboard path
const roleToPath = {
  Admin: '/dashboard/admin',
  Tailor: '/dashboard/tailor',
  Staff: '/dashboard/staff',
  Customer: '/dashboard/customer',
};

// Usage: <ProtectedRoute allowedRoles={['Admin', 'Tailor']}><Page/></ProtectedRoute>
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading, 'allowedRoles:', allowedRoles);

  if (loading) return <div>Loading...</div>; // Show loading while checking auth

  // Not logged in → go to login
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Enforce roles if provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Role mismatch. User role:', user.role, 'Required:', allowedRoles);
    // If role doesn't match route, send user to their dashboard instead of home
    const fallback = roleToPath[user.role] || '/';
    return <Navigate to={fallback} replace />;
  }

  console.log('ProtectedRoute - Access granted for user:', user.role);
  return children;
};

export default ProtectedRoute;
