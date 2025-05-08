import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  UncontrolledDropdown, 
  DropdownToggle, 
  DropdownMenu, 
  DropdownItem, 
  Badge 
} from 'reactstrap';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import './NotificationDropDown.css';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  // Initialize notification service and fetch notifications on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Initialize socket connection
    notificationService.initSocket(token);

    // Set up event listeners
    notificationService.onNewNotification(handleNewNotification);
    notificationService.onNotificationUpdate(handleNotificationUpdate);
    notificationService.onAllNotificationsRead(handleAllNotificationsRead);

    // Fetch initial notifications
    fetchNotifications();

    // Clean up socket connection on unmount
    return () => notificationService.disconnect();
  }, []);

  // Fetch notifications with pagination
  const fetchNotifications = async (newPage = 1) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(newPage, 10);
      
      if (newPage === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
      setPage(newPage);
      setHasMore(response.pagination.page < response.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  // Handle new notification event
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
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

  // Mark notification as read and navigate to destination
  const handleNotificationClick = async (notification, e) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
        // The state will be updated by the socket event
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // If notification has no URL, prevent default navigation
    if (!notification.url) {
      e.preventDefault();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // The state will be updated by the socket event
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get appropriate icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'ni-chat-round';
      case 'order':
        return 'ni-cart';
      case 'role_change':
        return 'ni-badge';
      case 'system':
        return 'ni-bell-55';
      case 'invoice':
        return 'ni-receipt-tax';
      case 'purchase':
        return 'ni-cart';
      case 'expense':
        return 'ni-money-coins';
      case 'payroll':
        return 'ni-single-02';
      default:
        return 'ni-bell-55';
    }
  };

  // Format the timestamp
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  const getNotificationUrl = (url, type) => {
    if (type === 'expense') return '/admin/expenses';
    if (type === 'message') return null; // Don't redirect for message notifications
    if (type === 'system' || type === 'role_change') return null; // Example non-routable types
  
    // Use original URL if present
    return url || null;
  };
    return (
    <UncontrolledDropdown nav className="notification-dropdown">
      <DropdownToggle nav className="position-relative">
  <i className="ni ni-bell-55" style={{ color: 'red' }} />
  {unreadCount > 0 && (
    <Badge color="danger" pill className="notification-badge">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )}
</DropdownToggle>
      <DropdownMenu right className="notification-menu" innerRef={dropdownRef}>
        <DropdownItem header className="d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge color="primary" pill onClick={markAllAsRead} style={{ cursor: 'pointer' }}>
              Mark all as read
            </Badge>
          )}
        </DropdownItem>
        
        <div className="notification-list">
          {notifications.length === 0 ? (
            <DropdownItem disabled>No notifications</DropdownItem>
          ) : (
            notifications.map(notification => (
                <DropdownItem
                key={notification._id}
                tag={notification.url ? Link : 'div'}
                to={getNotificationUrl(notification.url, notification.type)}
                onClick={(e) => handleNotificationClick(notification, e)}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  <i className={`ni ${getNotificationIcon(notification.type)}`} />
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-text">{notification.content}</div>
                  <div className="notification-time">{formatTime(notification.createdAt)}</div>
                </div>
              </DropdownItem>
            ))
          )}
          
          {loading && <DropdownItem disabled>Loading...</DropdownItem>}
          
          {hasMore && !loading && (
            <DropdownItem
              className="text-center text-primary"
              onClick={loadMore}
            >
              Load more
            </DropdownItem>
          )}
        </div>
        
        <DropdownItem divider />
        <DropdownItem tag={Link} to="/admin/notifications" className="text-center">
          View all notifications
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default NotificationDropdown;