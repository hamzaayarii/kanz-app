import axios from 'axios';
import io from 'socket.io-client';

class NotificationService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onNewNotification: null,
      onNotificationUpdate: null,
      onAllNotificationsRead: null
    };
    this.baseURL = 'http://localhost:5000/api/notifications';
  }

  // Initialize Socket.IO connection
  initSocket(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.setupSocketEvents();
    return this.socket;
  }

  // Set up socket event listeners
  setupSocketEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    this.socket.on('new_notification', (notification) => {
      if (this.callbacks.onNewNotification) {
        this.callbacks.onNewNotification(notification);
      }
    });

    this.socket.on('notification_updated', (notification) => {
      if (this.callbacks.onNotificationUpdate) {
        this.callbacks.onNotificationUpdate(notification);
      }
    });

    this.socket.on('all_notifications_marked_read', () => {
      if (this.callbacks.onAllNotificationsRead) {
        this.callbacks.onAllNotificationsRead();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  // Register callback functions
  onNewNotification(callback) {
    this.callbacks.onNewNotification = callback;
  }

  onNotificationUpdate(callback) {
    this.callbacks.onNotificationUpdate = callback;
  }

  onAllNotificationsRead(callback) {
    this.callbacks.onAllNotificationsRead = callback;
  }

  // API methods
  async getNotifications(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${this.baseURL}?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${this.baseURL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `${this.baseURL}/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Also emit socket event
      if (this.socket && this.socket.connected) {
        this.socket.emit('mark_notification_read', notificationId);
      }

      return response.data.notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `${this.baseURL}/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Also emit socket event
      if (this.socket && this.socket.connected) {
        this.socket.emit('mark_all_notifications_read');
      }

      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`${this.baseURL}/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService;