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
    
    return () => newSocket.close();
  }, []);
  

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('receive_message', (newMessage) => {
      if (newMessage.conversationId === currentConversationId) {
        setMessages(prev => [...prev, newMessage]);
      }
      setConversations(prev => prev.map(conv =>
        conv._id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      ));
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
    };
  }, [socket, currentConversationId]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsExpanded(!isExpanded);

  const selectContact = async (contact) => {
    setSelectedContact(contact);

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
      socket.emit('join_conversation', conversationId);

      const messagesRes = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      const messagesData = await messagesRes.json();
      setMessages(messagesData);
    } catch (err) {
      console.error('Error selecting contact:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentConversationId) return;

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
      setMessages(prev => [...prev, sentMessage]);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
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
                <Input placeholder="Search..." />
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
                    <span className="ml-2 font-weight-bold">{selectedContact.name}</span>
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
                      <div 
                        key={index} 
                        className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div 
                          style={{
                            maxWidth: '80%',
                            padding: '8px 12px',
                            borderRadius: isCurrentUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
                            backgroundColor: isCurrentUser ? '#0A66C2' : '#e1e9ee',
                            color: isCurrentUser ? 'white' : 'black',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                          }}
                        >
                          {msg.content}
                          <div 
                            className="text-right" 
                            style={{
                              fontSize: '0.75rem',
                              color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
                              marginTop: '4px'
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      onChange={(e) => setMessage(e.target.value)} 
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
                {conversations.length > 0 ? (
                  conversations.map((conv, index) => {
                    if (!conv || !conv.participant || !conv._id) {
                      console.log("Invalid conversation data:", conv);
                      return null;
                    }

                    return (
                      <div
                        key={conv._id}
                        className="contact-item d-flex p-2 border-bottom align-items-center"
                        style={{ 
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          ':hover': {
                            backgroundColor: '#f3f6f8'
                          }
                        }}
                        onClick={() => selectContact(conv.participant)}
                      >
                        <img
                          src={conv.participant.avatar || 'default-avatar.jpg'}
                          className="rounded-circle"
                          alt={conv.participant.name || 'User'}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div className="ml-2" style={{ flex: 1 }}>
                          <div className="d-flex justify-content-between">
                            <strong>{conv.participant.name || 'Unknown'}</strong>
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