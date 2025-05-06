import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// This is a simplified debug version of your dashboard to help troubleshoot API issues
const DebugDashboard = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  
  // Get the API URL from env variables or use a default
  useEffect(() => {
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setApiUrl(url);
  }, []);
  
  // Manually fetch data when user clicks the button
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const effectiveBusinessId = businessId || localStorage.getItem('defaultBusinessId') || 'default';
      const finalUrl = `${apiUrl}/dashboard/${effectiveBusinessId}`;
      
      console.log('Fetching from URL:', finalUrl);
      console.log('Using headers:', headers);
      
      const response = await axios.get(finalUrl, { headers });
      setData(response.data);
      console.log('Response received:', response);
    } catch (err) {
      setError(err);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Debugging</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        <div className="space-y-3">
          <div>
            <p><strong>API URL:</strong> {apiUrl || 'Not set'}</p>
            <p><strong>Business ID:</strong> {businessId || localStorage.getItem('defaultBusinessId') || 'Not set'}</p>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Not found'}</p>
          </div>
          
          <div>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test API Connection
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">API Response</h2>
        
        {loading && <p className="text-gray-600">Loading...</p>}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-red-700 font-medium">Error</h3>
            <p className="text-red-600 mt-1">
              {error.response ? `${error.response.status}: ${error.response.statusText}` : error.message}
            </p>
            {error.response && (
              <pre className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {JSON.stringify(error.response.data, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        {!loading && !error && data && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-green-700 font-medium">Success</h3>
            <pre className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};  

export default DebugDashboard;