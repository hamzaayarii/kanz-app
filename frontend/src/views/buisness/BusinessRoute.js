import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BusinessRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkBusiness = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                setIsAuthenticated(true);
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

        checkBusiness();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Use a proper loading component
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }

    return children;
};

export default BusinessRoute;