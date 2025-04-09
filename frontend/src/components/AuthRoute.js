import React from 'react';
import { Navigate } from 'react-router-dom';

// Helper function to get user from localStorage
const getUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Regular authentication route
const AuthRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

// Admin-only route
export const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const user = getUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  // Check if user is admin and not banned
  if (!user || user.role !== 'admin' || user.isBanned) {
    return <Navigate to="/admin/index" />;
  }
  
  return children;
};

// Helper function to check if user is admin
export const isUserAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin' && !user.isBanned;
};

export default AuthRoute;
