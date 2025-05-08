const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Get all notifications for the authenticated user
router.get('/', authenticate, notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Mark a notification as read
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

// Create a notification (for testing or manual creation)
router.post('/', authenticate, notificationController.createNotification);

module.exports = router;