import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Card, CardHeader, InputGroup, InputGroupAddon, 
  InputGroupText, Input, Button 
} from 'reactstrap';
import { 
  MessageCircle, ChevronDown, Search, 
  MoreVertical, Paperclip, Send, ArrowLeft
} from 'react-feather';

const ChatWindow = ({ currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Typing indicator states
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No auth token found");
      return;
    }
    
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
    
    return () => {
      if (currentConversationId) {
        newSocket.emit('leave_conversation', currentConversationId);
      }
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.conversationId === currentConversationId) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
          if (!messageExists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
      setConversations(prev => prev.map(conv =>
        conv._id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      ));
    };

    const handleUserTyping = ({ conversationId, userId, isTyping }) => {
      setTypingUsers(prev => {
        const currentTyping = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: isTyping 
            ? [...currentTyping.filter(id => id !== userId), userId]
            : currentTyping.filter(id => id !== userId)
        };
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, currentConversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    if (!socket) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/chat/conversations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing events
  const handleTyping = () => {
    if (!currentConversationId || !selectedContact) return;

    if (!isTyping) {
      socket.emit('typing', {
        conversationId: currentConversationId,
        isTyping: true
      });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: currentConversationId,
        isTyping: false
      });
      setIsTyping(false);
    }, 2000);
  };

  const toggleChat = () => setIsExpanded(!isExpanded);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const res = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        setSearchResults([]);
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSearchResults(data);
      } else if (data.users && Array.isArray(data.users)) {
        setSearchResults(data.users);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    }
  };

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    setIsSearching(false);
    setSearchQuery('');

    try {
      const res = await fetch('http://localhost:5000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ participantId: contact._id })
      });
      const { conversationId } = await res.json();
      setCurrentConversationId(conversationId);
      
      // Leave previous conversation if exists
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }

      const messagesRes = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      const messagesData = await messagesRes.json();
      setMessages(messagesData);

      const newConversation = {
        _id: conversationId,
        participants: [contact],
        lastMessage: messagesData.length > 0 ? messagesData[messagesData.length - 1] : null,
      };

      setConversations(prev => {
        const conversationExists = prev.some(conv => conv._id === conversationId);
        if (!conversationExists) {
          return [newConversation, ...prev];
        }
        return prev;
      });

    } catch (err) {
      console.error('Error selecting contact:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentConversationId) return;

    // Create a temporary message
    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: message,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      conversationId: currentConversationId,
      isTemp: true
    };

    // Add to state immediately
    setMessages(prev => [...prev, tempMessage]);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ conversationId: currentConversationId, content: message })
      });

      const sentMessage = await res.json();
      
      // Replace the temporary message with the real one
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
      
      // Update conversations
      setConversations(prev => prev.map(conv =>
        conv._id === currentConversationId
          ? { ...conv, lastMessage: sentMessage }
          : conv
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark the message as failed
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? { ...msg, failed: true } : msg)
      );
    }
  };
  
  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
  
      if (res.ok) {
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        if (conversationId === currentConversationId) {
          setSelectedContact(null);
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };
  
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <div className="text-center p-3 text-muted">No users found</div>;
    }
    
    return searchResults.map(user => (
      <div 
        key={user._id}
        className="contact-item d-flex p-2 border-bottom align-items-center"
        style={{ 
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          backgroundColor: '#ffffff',
          ':hover': {
            backgroundColor: '#f3f6f8'
          }
        }}
        onClick={() => selectContact(user)}
      >
        <img
          src={user.avatar || 'default-avatar.jpg'}
          className="rounded-circle"
          alt={user.fullName || 'User'}
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        />
        <div className="ml-2">
          <strong>{user.fullName || 'Unknown'}</strong>
          {user.email && <div className="text-muted small">{user.email}</div>}
          {user.phoneNumber && <div className="text-muted small">{user.phoneNumber}</div>}
        </div>
      </div>
    ));
  };

  const chatHeight = isExpanded ? '500px' : '40px';

  return (
    <div className="floating-chat" style={{ 
      position: 'fixed', 
      bottom: '0px', 
      right: '20px', 
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <Card className="shadow" style={{ 
        width: isExpanded ? '360px' : '200px', 
        height: chatHeight, 
        transition: 'all 0.3s ease',
        borderRadius: '8px 8px 0 0'
      }}>
        <CardHeader
          className="p-2 d-flex justify-content-between align-items-center"
          style={{ 
            backgroundColor: '#0A66C2', 
            color: 'white', 
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0'
          }}
          onClick={toggleChat}
        >
          <div className="d-flex align-items-center">
            <MessageCircle size={24} />
            <span className="ml-2">Chat</span>
          </div>
          <ChevronDown size={18} />
        </CardHeader>

        {isExpanded && (
          <>
            <div className="p-2 border-bottom">
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><Search size={18} /></InputGroupText>
                </InputGroupAddon>
                <Input 
                  placeholder="Search by name, email, phone..." 
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </InputGroup>
            </div>

            {selectedContact ? (
              <div className="conversation-container d-flex flex-column" style={{ height: '350px' }}>
                <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <Button 
                      color="link" 
                      className="p-0 mr-2"
                      onClick={() => {
                        setSelectedContact(null);
                        setCurrentConversationId(null);
                      }}
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <img 
                      src={selectedContact.avatar || 'default-avatar.jpg'} 
                      alt="avatar" 
                      className="rounded-circle" 
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                    <span className="ml-2 font-weight-bold">{selectedContact.fullName || selectedContact.name}</span>
                  </div>
                  <MoreVertical size={20} />
                </div>

                <div 
                  className="messages-container flex-grow-1 p-3" 
                  style={{ 
                    overflowY: 'auto',
                    backgroundColor: '#f3f6f8'
                  }}
                >
                  {messages.map((msg, index) => {
                    if (!msg || !msg.sender) return null;
                    const isCurrentUser = currentUser && msg.sender._id === currentUser._id;

                    return (
                      <div key={index} className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                        {!isCurrentUser && (
                          <div className="d-flex flex-column align-items-start mr-2">
                            <img 
                              src={msg.sender.avatar || 'default-avatar.jpg'} 
                              alt="avatar" 
                              className="rounded-circle" 
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                            <small className="text-muted">{msg.sender.fullName || msg.sender.name}</small>
                          </div>
                        )}

                        <div style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: isCurrentUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
                          backgroundColor: isCurrentUser ? '#0A66C2' : '#e1e9ee',
                          color: isCurrentUser ? 'white' : 'black',
                          boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                        }}>
                          {msg.content}
                          <div className="text-right" style={{
                            fontSize: '0.75rem',
                            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
                            marginTop: '4px'
                          }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typingUsers[currentConversationId]?.length > 0 && (
                    <div className="d-flex mb-3 justify-content-start">
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '18px 18px 18px 0',
                        backgroundColor: '#e1e9ee',
                        color: 'black',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                      }}>
                        {typingUsers[currentConversationId]
                          .map(userId => userId === selectedContact._id ? selectedContact.fullName : 'Someone')
                          .join(', ')} is typing...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="d-flex p-2 border-top">
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <Button color="link" className="p-0">
                        <Paperclip size={18} />
                      </Button>
                    </InputGroupAddon>
                    <Input 
                      value={message} 
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..." 
                      style={{ borderRadius: '20px' }}
                    />
                    <InputGroupAddon addonType="append">
                      <Button 
                        color="primary" 
                        style={{ 
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        type="submit"
                      >
                        <Send size={16} />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
              </div>
            ) : (
              <div 
                className="contacts-container" 
                style={{ 
                  height: '350px', 
                  overflowY: 'auto',
                  backgroundColor: '#ffffff'
                }}
              >
                {isSearching ? (
                  renderSearchResults()
                ) : conversations.length > 0 ? (
                  conversations.map((conv, index) => {
                    if (!conv || !conv.participant || !conv._id) {
                      console.log("Invalid conversation data:", conv);
                      return null;
                    }

                    return (
                      <div
                        key={conv._id}
                        className="contact-item d-flex p-2 border-bottom align-items-center justify-content-between"
                        style={{ 
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          ':hover': {
                            backgroundColor: '#f3f6f8'
                          }
                        }}
                      >
                        <div 
                          className="d-flex align-items-center" 
                          onClick={() => selectContact(conv.participant)}
                          style={{ flex: 1 }}
                        >
                          <img
                            src={conv.participant.avatar || 'default-avatar.jpg'}
                            className="rounded-circle"
                            alt={conv.participant.fullName || conv.participant.name || 'User'}
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div className="ml-2" style={{ flex: 1 }}>
                            <div className="d-flex justify-content-between">
                              <strong>{conv.participant.fullName || conv.participant.name || 'Unknown'}</strong>
                              <small className="text-muted">
                                {conv.lastMessage?.createdAt 
                                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </small>
                            </div>
                            <p 
                              className="mb-0 text-muted" 
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '200px'
                              }}
                            >
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>

                        <button 
                          className="btn btn-sm btn-outline-danger ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv._id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    );
                  }).filter(Boolean)
                ) : (
                  <div className="text-center p-4 text-muted">No conversations found</div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWindow;