import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const [calendarData, setCalendarData] = useState({});
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessId, setBusinessId] = useState('');
  const navigate = useNavigate();

  // Get auth token and business ID when component mounts
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const bizId = localStorage.getItem('businessId');
    
    if (!token) {
      navigate('/auth/login');
      return;
    }
    
    if (!bizId) {
      // If no business ID, fetch user's businesses first
      fetchUserBusinesses(token);
    } else {
      setBusinessId(bizId);
    }
  }, [navigate]);

  const fetchUserBusinesses = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/business/user-businesses", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.businesses.length > 0) {
        const firstBusinessId = response.data.businesses[0]._id;
        localStorage.setItem('businessId', firstBusinessId);
        setBusinessId(firstBusinessId);
      }
    } catch (err) {
      console.error('Error fetching user businesses:', err);
      setError('Failed to load business information');
    }
  };

  // Fetch calendar data for the current month
  const fetchCalendarData = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      
      const response = await axios.get('http://localhost:5000/api/calendar/data', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { businessId, month, year }
      });
      
      setCalendarData(response.data);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError(err.response?.data?.message || 'Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch details for a specific day
  const fetchDayDetails = async (date) => {
    if (!businessId || !date) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await axios.get('http://localhost:5000/api/calendar/day-details', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { businessId, date: formattedDate }
      });
      
      setDayDetails(response.data);
    } catch (err) {
      console.error('Error fetching day details:', err);
      setError(err.response?.data?.message || 'Failed to load day details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchDayDetails(date);
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Fetch calendar data when the current date or businessId changes
  useEffect(() => {
    if (businessId) {
      fetchCalendarData();
    }
  }, [currentDate, businessId]);

  return (
    <CalendarContext.Provider
      value={{
        calendarData,
        currentDate,
        selectedDate,
        dayDetails,
        isLoading,
        error,
        handleDateSelect,
        navigateMonth,
        refreshCalendarData: fetchCalendarData,
        businessId
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};