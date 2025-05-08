const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Create a notification and send it in real-time
   * @param {Object} notificationData - Notification details
   * @returns {Promise<Object>} - The created notification
   */
  async createNotification(notificationData) {
    try {
      // Create notification in database
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Populate sender information if exists
      if (notification.sender) {
        await notification.populate('sender', 'fullName avatar');
      }
      
      // Send notification to recipient in real-time
      this.io.to(`user_${notification.recipient}`).emit('new_notification', notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple recipients
   * @param {Array} recipients - Array of user IDs
   * @param {Object} notificationData - Base notification data without recipient
   * @returns {Promise<Array>} - Array of created notifications
   */
  async notifyMultipleUsers(recipients, notificationData) {
    try {
      const notifications = [];
      
      for (const recipientId of recipients) {
        const notification = await this.createNotification({
          ...notificationData,
          recipient: recipientId
        });
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error sending multiple notifications:', error);
      throw error;
    }
  }

  /**
   * Create a notification for users with specific role
   * @param {String} role - User role (e.g., 'accountant', 'business_owner')
   * @param {Object} notificationData - Base notification data without recipient
   * @param {String} businessId - Optional business ID to filter users
   * @returns {Promise<Array>} - Array of created notifications
   */
  async notifyByRole(role, notificationData, businessId = null) {
    try {
      // Find users with the specified role
      const query = { role };
      if (businessId) {
        // Add logic to filter by business ID if your User model has that relationship
        // This depends on how you associate users with businesses
      }
      
      const users = await User.find(query).select('_id');
      const userIds = users.map(user => user._id);
      
      return await this.notifyMultipleUsers(userIds, notificationData);
    } catch (error) {
      console.error(`Error notifying users with role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Create a business-specific notification
   * @param {String} businessId - Business ID
   * @param {Object} notificationData - Base notification data
   * @returns {Promise<Array>} - Array of created notifications
   */
  async notifyBusinessMembers(businessId, notificationData) {
    try {
      // Find all users associated with this business
      // This depends on your data model - adjust as needed
      const users = await User.find({ 
        // This is a placeholder - modify according to your actual data model
        $or: [
          { role: 'business_owner', /* business association field */ },
          { role: 'accountant', assignedTo: businessId }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      return await this.notifyMultipleUsers(userIds, {
        ...notificationData,
        businessId
      });
    } catch (error) {
      console.error('Error sending business notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;