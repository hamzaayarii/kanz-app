// src/components/BusinessRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BusinessRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [hasBusiness, setHasBusiness] = useState(false);

    useEffect(() => {
        const checkBusiness = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://your-api-url/api/business/check', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Assuming your API returns data with a hasBusiness property or similar
                setHasBusiness(response.data.hasBusiness);
                setLoading(false);
            } catch (error) {
                console.error('Error checking business:', error);
                setLoading(false);
            }
        };

        checkBusiness();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Or use a proper loading component
    }

    // If authenticated but no business, redirect to business registration
    const isAuthenticated = !!localStorage.getItem('authToken');

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }

    if (!hasBusiness) {
        return <Navigate to="/admin/business-registration" />;
    }

    return children;
};

export default BusinessRoute;