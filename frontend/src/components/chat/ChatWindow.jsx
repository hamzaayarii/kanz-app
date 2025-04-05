import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody, Button, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { MessageCircle, X, Send, Paperclip, Smile, ChevronDown, ChevronUp, Search, MoreVertical } from 'react-feather';
import io from 'socket.io-client';
import ConversationItem from './ConversationItem';
const ChatWindow = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('targeted');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('message', (newMessage) => {
      if (newMessage.conversationId === currentConversationId) {
        setMessages(prev => [...prev, newMessage]);
      }
      // Update last message in conversations list
      setConversations(prev => prev.map(conv =>
        conv._id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      ));
    });

    return () => {
      socket.off('connect');
      socket.off('message');
    };
  }, [socket, currentConversationId]);

  // Fetch conversations when component mounts or socket changes
  useEffect(() => {
    if (!socket) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          console.error('Expected array but got:', data);
          setConversations([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]); // Fallback to empty array on error
      }
    };

    fetchConversations();
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ participantId: contact._id })
      });

      const { conversationId } = await response.json();
      setCurrentConversationId(conversationId);

      // Join the conversation room
      socket.emit('join_conversation', conversationId);

      // Fetch messages for this conversation
      const messagesResponse = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const messagesData = await messagesResponse.json();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error selecting contact:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '' || !currentConversationId) return;

    try {
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          conversationId: currentConversationId,
          content: message
        })
      });

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setMessage(''); // Clear the input field after sending the message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const chatHeight = isExpanded ? '500px' : '40px';
  return (
    <div className="floating-chat" style={{ position: 'fixed', bottom: '0px', right: '20px', zIndex: '1000' }}>
      <Card className="shadow" style={{ width: isExpanded ? '360px' : '200px', height: chatHeight, transition: 'height 0.3s ease' }}>
        {/* Chat Header */}
        <CardHeader
          className="p-2 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: '#0A66C2', color: 'white', cursor: 'pointer', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
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
            {/* Chat Tabs */}
            <div className="chat-tabs d-flex border-bottom">
              <div className={`tab-item ${activeTab === 'targeted' ? 'active' : ''}`} onClick={() => setActiveTab('targeted')}>Targeted</div>
              <div className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</div>
            </div>

            {/* Search Bar */}
            <div className="search-container p-2 border-bottom">
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><Search size={18} /></InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search..." />
              </InputGroup>
            </div>

            {selectedContact ? (
              <div className="conversation-container" style={{ display: 'flex', flexDirection: 'column', height: '350px' }}>
                {/* Conversation Header */}
                <div className="conversation-header d-flex justify-content-between align-items-center p-2 border-bottom">
                  <div className="d-flex align-items-center">
                    {selectedContact && (
                      <>
                        <img
                          src={selectedContact.avatar || 'default-avatar.jpg'}
                          alt={selectedContact.fullName}
                          className="avatar"
                        />
                        <span className="ml-2">{selectedContact.fullName}</span>
                      </>
                    )}
                  </div>
                  <MoreVertical size={20} />
                </div>

                {/* Messages */}
                <div className="messages-container" style={{ flexGrow: 1, overflow: 'auto', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                {Array.isArray(conversations) ? (
  conversations.length > 0 ? (
    conversations.map((conversation) => (
      <ConversationItem 
        key={conversation._id} 
        conversation={conversation} 
        onSelect={selectContact}
      />
    ))
  ) : (
    <div className="text-center p-4">No conversations found</div>
  )
) : (
  <div className="text-center p-4">Loading conversations...</div>
)}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="message-input-container d-flex p-2 border-top">
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><Paperclip size={18} /></InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <InputGroupAddon addonType="append">
                      <Button onClick={handleSendMessage} color="primary"><Send size={18} /></Button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            ) : (
              <div className="contacts-container" style={{ height: '350px', overflow: 'auto' }}>
                {Array.isArray(conversations) ? (
                  conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <div
                        key={conversation._id}
                        className="contact-item d-flex p-2 border-bottom"
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectContact(conversation.participant)}
                      >
                        <img src={'default-avatar.jpg'}  className="avatar" />
                        <div className="ml-2">
                          <strong></strong>
                          <p>{conversation.lastMessage.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4">No conversations found</div>
                  )
                ) : (
                  <div className="text-center p-4">Loading conversations...</div>
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