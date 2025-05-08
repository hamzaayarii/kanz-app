const Notification = require('../models/Notification');

// Get all notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    
    // Get notifications with pagination
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'fullName avatar')
      .populate('relatedId');
    
    const total = await Notification.countDocuments({ recipient: userId });
    
    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    
    res.status(200).json({
      message: 'All notifications marked as read',
      updated: result.nModified
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification deleted', notificationId });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a notification (for testing or manual creation)
exports.createNotification = async (req, res) => {
  try {
    const { recipient, type, title, content, relatedId, onModel, url } = req.body;
    
    const notification = new Notification({
      recipient,
      sender: req.user._id,
      type,
      title,
      content,
      relatedId,
      onModel,
      url
    });
    
    const savedNotification = await notification.save();
    
    // Send real-time notification
    if (req.io) {
      req.io.to(`user_${recipient}`).emit('new_notification', savedNotification);
    }
    
    res.status(201).json({ notification: savedNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create notification (for use in other controllers)
exports.createNotificationHelper = async (io, notificationData) => {
  try {
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    
    // Send real-time notification
    io.to(`user_${notificationData.recipient}`).emit('new_notification', savedNotification);
    
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification helper:', error);
    throw error;
  }
};