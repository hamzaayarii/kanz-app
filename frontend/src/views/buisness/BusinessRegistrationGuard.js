import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const BusinessRegistrationGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkBusinessRegistration = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            // Decode token to get user role
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error decoding token:', error);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/business/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBusinesses(response.data.businesses);
                setLoading(false);
            } catch (error) {
                console.error('Error checking business:', error);
                setLoading(false);
            }
        };

        checkBusinessRegistration();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }

    // Redirect accountants to their dashboard
    if (userRole === 'accountant') {
        return <Navigate to="/admin/journal" />;
    }

    return children;
};

export default BusinessRegistrationGuard;
