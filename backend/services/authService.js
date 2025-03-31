import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // adjust this to match your backend URL

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  verifyEmail: async (code) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, { code });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/check`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

export default authService;