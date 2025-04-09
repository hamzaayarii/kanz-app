// import axios from 'axios';

// const API_URL = '/api/chat';

// export const getChatHistory = async (conversationId) => {
//   try {
//     const response = await axios.get(`${API_URL}/messages/${conversationId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching chat history:', error);
//     throw error;
//   }
// };

// export const sendMessage = async (messageData) => {
//   try {
//     const response = await axios.post(`${API_URL}/messages`, messageData);
//     return response.data;
//   } catch (error) {
//     console.error('Error sending message:', error);
//     throw error;
//   }
// };