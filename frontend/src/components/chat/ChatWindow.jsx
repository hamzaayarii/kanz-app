import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Card, CardHeader, InputGroup, InputGroupAddon, 
  InputGroupText, Input, Button 
} from 'reactstrap';
import { 
  MessageCircle, ChevronDown, Search, 
  MoreVertical, Paperclip, Send 
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
      return; // Don't attempt connection without token
    }
    
    console.log("Auth token being used:", token.substring(0, 10) + "...");
    
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
      // Try to refresh the token or redirect to login
      if (err.message.includes('Authentication')) {
        console.log('Authentication error detected - consider redirecting to login');
      }
    });
    
    return () => newSocket.close();
  }, []);
  

  // Set up socket event listeners
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

  // Fetch conversations
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

  // Auto-scroll to bottom of messages
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
    <div className="floating-chat" style={{ position: 'fixed', bottom: '0px', right: '20px', zIndex: 1000 }}>
      <Card className="shadow" style={{ width: isExpanded ? '360px' : '200px', height: chatHeight, transition: 'height 0.3s ease' }}>
        <CardHeader
          className="p-2 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: '#0A66C2', color: 'white', cursor: 'pointer' }}
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
                    <img src={selectedContact.avatar || 'default-avatar.jpg'} alt="avatar" className="avatar" />
                    <span className="ml-2">{selectedContact.name}</span>
                  </div>
                  <MoreVertical size={20} />
                </div>

                <div className="messages-container flex-grow-1 p-2" style={{ overflowY: 'auto' }}>
                {messages.map((msg, index) => {
  // Safety check to ensure msg and sender exist before accessing properties
  if (!msg || !msg.sender) return null;
  
  return (
    <div key={index} className={`message ${msg.sender && currentUser && msg.sender._id === currentUser._id ? 'sent' : 'received'}`}>
      {msg.content}
    </div>
  );
})}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="d-flex p-2 border-top">
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><Paperclip size={18} /></InputGroupText>
                    </InputGroupAddon>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
                    <InputGroupAddon addonType="append">
                      <Button color="primary"><Send size={18} /></Button>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
              </div>
            ) : (
              <div className="contacts-container" style={{ height: '350px', overflowY: 'auto' }}>
             {conversations.length > 0 ? (
  conversations.map((conv, index) => {
    if (!conv || !conv.participant || !conv._id) {
      console.log("Invalid conversation data:", conv);
      return null; // Skip rendering this conversation if data is invalid
    }

    return (
      <div
        key={conv._id}
        className="contact-item d-flex p-2 border-bottom"
        style={{ cursor: 'pointer' }}
        onClick={() => selectContact(conv.participant)}
      >
        <img
          src={conv.participant.avatar || 'default-avatar.jpg'}
          className="avatar"
          alt={conv.participant.name || 'User'}
        />
        <div className="ml-2">
          <strong>{conv.participant.name || 'Unknown'}</strong>
          <p>{conv.lastMessage?.content || 'No message'}</p>
        </div>
      </div>
    );
  }).filter(Boolean) // Remove null items
) : (
  <div className="text-center p-4">No conversations found</div>
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