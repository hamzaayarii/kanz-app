import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BusinessRegistrationGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
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

    return children;
};

export default BusinessRegistrationGuard;
