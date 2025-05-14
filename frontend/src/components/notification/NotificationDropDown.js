import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  UncontrolledDropdown, 
  DropdownToggle, 
  DropdownMenu, 
  DropdownItem
} from 'reactstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMessageSquare, FiShoppingCart, FiUser, FiAlertCircle, FiFileText, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import './NotificationDropDown.scss';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    notificationService.initSocket(token);
    notificationService.onNewNotification(handleNewNotification);
    notificationService.onNotificationUpdate(handleNotificationUpdate);
    notificationService.onAllNotificationsRead(handleAllNotificationsRead);

    fetchNotifications();

    return () => notificationService.disconnect();
  }, []);

  const fetchNotifications = async (newPage = 1) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(newPage, 10);
      
      setNotifications(prev => newPage === 1 ? 
        response.notifications : [...prev, ...response.notifications]);
      setUnreadCount(response.unreadCount);
      setPage(newPage);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show desktop notification if browser supports it
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { 
        body: notification.content,
        icon: getNotificationIcon(notification.type)
      });
    }
  };

  const handleNotificationClick = async (notification, e) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    if (!notification.url) e.preventDefault();
  };
  
  // Handle notification update event
  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === updatedNotification._id ? updatedNotification : notification
      )
    );
    
    // Update unread count if notification was marked as read
    if (updatedNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Handle all notifications read event
  const handleAllNotificationsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: <FiMessageSquare className="text-info" />,
      order: <FiShoppingCart className="text-warning" />,
      role_change: <FiUser className="text-primary" />,
      system: <FiAlertCircle className="text-danger" />,
      invoice: <FiFileText className="text-success" />,
      purchase: <FiShoppingCart className="text-warning" />,
      expense: <FiDollarSign className="text-danger" />,
      payroll: <FiCreditCard className="text-success" />
    };
    return icons[type] || <FiBell className="text-primary" />;
  };
  
  const formatTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

  // Helper function to format notification content that might contain user information
  const formatNotificationContent = (notification) => {
    // For message type notifications, ensure we display the sender's name properly
    if (notification.type === 'message' && notification.sender && notification.sender.fullName) {
      return `${notification.sender.fullName} sent you a message`;
    }
    
    // Return the regular content for other notification types
    return notification.content;
  };
  
  return (
    <UncontrolledDropdown nav inNavbar className="notification-dropdown">
      <DropdownToggle nav caret={false} className="position-relative">
        <div className="notification-trigger">
          <motion.div
            animate={{ 
              rotate: isOpen ? [0, 15, -15, 0] : 0,
              scale: isOpen ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <FiBell size={20} className="icon" />
          </motion.div>
          
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="notification-counter"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </div>
      </DropdownToggle>

      <DropdownMenu right className="notification-panel">
        <div className="notification-header">
          <h5>Notifications</h5>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-list">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell size={40} className="empty-icon" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownItem
                    tag={notification.url ? Link : 'div'}
                    to={notification.url || '#'}
                    onClick={(e) => handleNotificationClick(notification, e)}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.read && <span className="unread-indicator" />}
                      </div>
                      <p className="notification-message">
                        {formatNotificationContent(notification)}
                      </p>
                      <div className="notification-time">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </DropdownItem>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="notification-footer">
            <button 
              className="load-more"
              onClick={() => fetchNotifications(page + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default NotificationDropdown;