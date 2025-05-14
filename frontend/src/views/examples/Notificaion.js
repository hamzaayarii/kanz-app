import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Badge,
  CardFooter,
  Input,
  FormGroup,
  Label
} from 'reactstrap';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow, format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [typeFilter, setTypeFilter] = useState('all');

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

  // Fetch notifications when filters change
  useEffect(() => {
    fetchNotifications(1);
  }, [filter, typeFilter, limit]);

  // Fetch notifications with pagination and filters
  const fetchNotifications = async (newPage = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', newPage);
      params.append('limit', limit);
      
      if (filter !== 'all') {
        params.append('read', filter === 'read');
      }
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      const response = await notificationService.getNotifications(newPage, limit);
      
      if (newPage === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
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
    // Only add the notification if it matches the current filters
    if (
      (filter === 'all' || 
       (filter === 'read' && notification.read) || 
       (filter === 'unread' && !notification.read)) &&
      (typeFilter === 'all' || notification.type === typeFilter)
    ) {
      setNotifications(prev => [notification, ...prev]);
    }
  };

  // Handle notification update event
  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === updatedNotification._id ? updatedNotification : notification
      )
    );
  };

  // Handle all notifications read event
  const handleAllNotificationsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Mark notification as read and navigate to destination
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
        // The state will be updated by the socket event
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
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

  // Delete a notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get appropriate badge color for notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'info';
      case 'order':
        return 'primary';
      case 'role_change':
        return 'warning';
      case 'system':
        return 'default';
      case 'invoice':
        return 'success';
      case 'purchase':
        return 'primary';
      case 'expense':
        return 'danger';
      case 'payroll':
        return 'info';
      default:
        return 'default';
    }
  };

  // Format the timestamp
  const formatTime = (date) => {
    const notificationDate = new Date(date);
    return {
      relative: formatDistanceToNow(notificationDate, { addSuffix: true }),
      absolute: format(notificationDate, 'PPpp') // Format: Apr 29, 2023, 2:15 PM
    };
  };

  return (
    <>
      <Container className="mt-4" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center justify-content-between mb-3">
                  <Col xs="auto">
                    <h3 className="mb-0">Your Notifications</h3>
                  </Col>
                  <Col xs="auto">
                    <Button
                      color="primary"
                      onClick={markAllAsRead}
                      size="sm"
                    >
                      Mark All as Read
                    </Button>
                  </Col>
                </Row>
                <Row className="align-items-end">
                  <Col md={4} sm={6} xs={12}>
                    <FormGroup className="mb-2 mb-md-0">
                      <Label for="filterStatus" className="mr-sm-2 sr-only">Filter by Status</Label>
                      <Input
                        type="select"
                        name="filterStatus"
                        id="filterStatus"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        bsSize="sm"
                      >
                        <option value="all">All Status</option>
                        <option value="read">Read</option>
                        <option value="unread">Unread</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4} sm={6} xs={12}>
                    <FormGroup className="mb-2 mb-md-0">
                      <Label for="filterType" className="mr-sm-2 sr-only">Filter by Type</Label>
                      <Input
                        type="select"
                        name="filterType"
                        id="filterType"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        bsSize="sm"
                      >
                        <option value="all">All Types</option>
                        <option value="message">Messages</option>
                        <option value="order">Orders</option>
                        <option value="role_change">Role Changes</option>
                        <option value="system">System</option>
                        <option value="invoice">Invoices</option>
                        <option value="purchase">Purchases</option>
                        <option value="expense">Expenses</option>
                        <option value="payroll">Payrolls</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4} sm={12} xs={12}>
                    <FormGroup className="mb-0">
                      <Label for="itemsPerPage" className="mr-sm-2 sr-only">Items per page</Label>
                      <Input
                        type="select"
                        name="itemsPerPage"
                        id="itemsPerPage"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        bsSize="sm"
                      >
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {loading && page === 1 ? (
                  <div className="text-center my-4">
                    <Spinner color="primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center text-muted my-4">
                    No notifications found
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => {
                      const time = formatTime(notification.createdAt);
                      return (
                        <div
                          key={notification._id}
                          className={`notification-item p-3 mb-2 border rounded ${!notification.read ? 'bg-light' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Row className="align-items-center">
                            <Col xs="12" md="8">
                              <div className="d-flex align-items-center">
                                <Badge
                                  color={getNotificationColor(notification.type)}
                                  className="mr-3"
                                  pill
                                >
                                  {notification.type.replace('_', ' ')}
                                </Badge>
                                <div>
                                  <h4 className="mb-1">{notification.title}</h4>
                                  <p className="mb-1">{notification.content}</p>
                                  <small className="text-muted" title={time.absolute}>
                                    {time.relative}
                                  </small>
                                </div>
                              </div>
                            </Col>
                            <Col xs="12" md="4" className="text-md-right mt-2 mt-md-0">
                              {/* View button removed based on user request
                              {notification.url && (
                                <Button
                                  color="primary"
                                  size="sm"
                                  tag={Link}
                                  to={notification.url}
                                  className="mr-2"
                                >
                                  View
                                </Button>
                              )}
                              */}
                              <Button
                                color="danger"
                                size="sm"
                                onClick={(e) => deleteNotification(notification._id, e)}
                              >
                                Delete
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {loading && page > 1 && (
                  <div className="text-center my-3">
                    <Spinner color="primary" size="sm" />
                  </div>
                )}
              </CardBody>
              {hasMore && !loading && (
                <CardFooter className="text-center">
                  <Button color="primary" outline onClick={loadMore}>
                    Load More
                  </Button>
                </CardFooter>
              )}
            </Card> 
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Notifications;