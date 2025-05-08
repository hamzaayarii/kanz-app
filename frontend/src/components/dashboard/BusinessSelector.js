import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, BuildingIcon, PieChartIcon } from 'lucide-react';

const BusinessSelector = () => {
  const [businesses, setBusinesses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          navigate('/auth/login');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/business/user-businesses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setBusinesses(data.businesses || []);
          setError(null);
          
          // Check localStorage for default business
          const defaultBusinessId = localStorage.getItem('defaultBusinessId');
          if (defaultBusinessId) {
            const defaultBusiness = data.businesses.find(b => b._id === defaultBusinessId);
            if (defaultBusiness) {
              setSelectedBusiness(defaultBusiness);
            }
          }
        } else {
          setError(data.message || 'Failed to load businesses');
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Error connecting to server. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBusinesses();
  }, [navigate]);

  const handleSelect = (business) => {
    if (business === 'all') {
      // Navigate to aggregated view
      localStorage.removeItem('defaultBusinessId'); // Clear default business
      navigate('/admin/dashboard');
    } else {
      // Set selected business
      setSelectedBusiness(business);
      localStorage.setItem('defaultBusinessId', business._id);
      navigate(`/admin/dashboard/${business._id}`);
    }
    
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md animate-pulse">
        <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
        <div className="h-5 bg-gray-300 rounded w-40"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 px-4 py-2 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedBusiness ? (
          <>
            <BuildingIcon className="w-4 h-4 mr-2 text-gray-500" />
            <span>{selectedBusiness.name}</span>
          </>
        ) : (
          <>
            <PieChartIcon className="w-4 h-4 mr-2 text-blue-500" />
            <span>Toutes les entreprises</span>
          </>
        )}
        <ChevronDownIcon className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {/* All businesses option */}
            <li
              onClick={() => handleSelect('all')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
            >
              <PieChartIcon className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">Toutes les entreprises</span>
            </li>
            
            {/* Divider */}
            <li className="border-t border-gray-200 my-1"></li>
            
            {/* Individual businesses */}
            {businesses.map((business) => (
              <li
                key={business._id}
                onClick={() => handleSelect(business)}
                className={`flex items-center px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer ${
                  selectedBusiness && selectedBusiness._id === business._id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700'
                }`}
              >
                <BuildingIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span>{business.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BusinessSelector;