import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  // Retrieve the authentication token from localStorage
  const isAuthenticated = !!localStorage.getItem('authToken');

  // If the user is authenticated, render the children components; otherwise, redirect to login
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

export default AuthRoute;
