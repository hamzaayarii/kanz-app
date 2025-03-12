import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BusinessRegistrationGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkBusinessRegistration = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);

            try {
                const response = await axios.get('http://localhost:5000/api/business/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setHasBusiness(response.data.hasBusiness);
                setLoading(false);
            } catch (error) {
                console.error('Error checking business:', error);
                // If there's an error, we'll assume they need to register to be safe
                setHasBusiness(false);
                setLoading(false);

                // If unauthorized, clear token and redirect to login
                if (error.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                }
            }
        };

        checkBusinessRegistration();
    }, []);

    if (loading) {
        // Return a simple loading indicator
        return <div className="text-center pt-5">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/auth/login" replace />;
    }

    if (!hasBusiness) {
        // Redirect to business registration if they don't have a business
        return <Navigate to="/standalone/business-registration" replace />;
    }

    // If authenticated and has a business, render the dashboard
    return children;
};

export default BusinessRegistrationGuard;