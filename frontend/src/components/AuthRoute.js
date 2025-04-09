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

// Helper function to check if user is business owner
export const isUserBusinessOwner = () => {
  const user = getUser();
  return user && user.role === 'business_owner';
};

// Helper function to check if user is accountant
export const isUserAccountant = () => {
  const user = getUser();
  return user && user.role === 'accountant';
};

// Business owner only route
export const BusinessOwnerRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const user = getUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  // Check if user is business owner
  if (!user || user.role !== 'business_owner') {
    return <Navigate to="/admin/index" />;
  }
  
  return children;
};

export default AuthRoute;
