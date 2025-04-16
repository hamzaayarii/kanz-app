import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle, Badge, ListGroup, ListGroupItem } from 'reactstrap';

const LatestMessages = () => {
  const [latestMessages, setLatestMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          return;
        }

        const response = await axios.get('http://localhost:5000/api/chat/latest-messages?limit=3', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setLatestMessages(response.data.latestMessages);
          console.log('Latest messages:', response.data.latestMessages);
        } else {
          setError(response.data.message || 'Failed to load latest messages');
        }
      } catch (error) {
        console.error('Error fetching latest messages:', error);
        setError(error.response?.data?.message || 'An error occurred while loading messages');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMessages();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="shadow">
        <CardHeader className="border-0">
          <CardTitle tag="h1" className="mb-0">Recent Messages</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center">Loading messages...</div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow">
        <CardHeader className="border-0">
          <CardTitle tag="h6" className="mb-0">Recent Messages</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center text-danger">Error: {error}</div>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card className="shadow rounded-3 bg-light">
      <CardHeader className="border-0 bg-gradient-primary text-white rounded-top-3 py-3 px-4">
        <CardTitle tag="h4" className="mb-0 fw-bold">📩 Recent Messages</CardTitle>
      </CardHeader>
  
      <CardBody className="px-4 py-3">
        {latestMessages.length === 0 ? (
          <div className="text-center text-muted fs-5">No messages yet</div>
        ) : (
          <ListGroup flush>
            {latestMessages.map((message) => (
              <ListGroupItem 
                key={message._id} 
                className="bg-white rounded shadow-sm mb-3 border-0 px-3 py-2"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {message.sender.profileImage ? (
                        <img 
                          src={message.sender.profileImage} 
                          alt={message.sender.name || message.sender.username} 
                          className="rounded-circle shadow-sm"
                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "48px", height: "48px", fontSize: "1.25rem", fontWeight: "bold" }}
                        >
                          {(message.sender.name || message.sender.username || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h6 className="mb-1 text-dark fs-6">{message.sender.name || message.sender.username}</h6>
                      <p className="mb-0 text-muted fs-6">{truncateText(message.content, 40)}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-secondary d-block">{formatDate(message.createdAt)}</small>
                    {!message.isRead && (
                      <Badge color="danger" pill className="mt-1">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </CardBody>
    </Card>
  );
  
};

export default LatestMessages;