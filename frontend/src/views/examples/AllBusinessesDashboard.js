import React, { useEffect, useState } from 'react';
// Import BusinessSelector with the correct import syntax
import BusinessSelector from '../../components/dashboard/BusinessSelector';  


const AllBusinessesDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // Handle unauthorized access
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/dashboard/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          setData(responseData);
        } else {
          console.error('Failed to fetch dashboard data:', responseData.message);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Businesses Dashboard</h1>
        <BusinessSelector />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard content here */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Summary</h2>
            {/* Display dashboard data */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBusinessesDashboard;