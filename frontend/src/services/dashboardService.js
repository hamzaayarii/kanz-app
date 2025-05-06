import axios from 'axios';

// Base API URL - adjust this based on your environment configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

// Interceptor to add the token from localStorage if available
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Dashboard data service
const dashboardService = {
  /**
   * Get dashboard data for a specific business
   * @param {string} businessId - The ID of the business
   * @returns {Promise} - Promise resolving to dashboard data
   */
  getDashboardData: async (businessId) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/${businessId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /**
   * Get aggregated dashboard data for all businesses owned by the user
   * @returns {Promise} - Promise resolving to aggregated dashboard data
   */
  getAllBusinessesDashboardData: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/all`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching aggregated dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardService;