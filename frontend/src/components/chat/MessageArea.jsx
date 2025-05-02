import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'react-feather';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

const MessageArea = ({ 
  selectedContact, 
  messages: initialMessages, 
  currentUser, 
  typingUsers,
  currentConversationId,
  handleChatBack,
  onSendMessage
}) => {
  // Keep local messages state to prevent duplicate rendering
  const [messages, setMessages] = useState(initialMessages || []);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(initialMessages?.length || 0);

  // Update local messages when props change, but avoid duplicates
  useEffect(() => {
    if (initialMessages && initialMessages.length !== prevMessagesLengthRef.current) {
      setMessages(initialMessages);
      prevMessagesLengthRef.current = initialMessages.length;
    }
  }, [initialMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const sendMessage = (content) => {
    // Generate a temporary ID for optimistic rendering
    const tempId = `temp-${Date.now()}`;
    
    // Create new message object
    const newMessage = {
      _id: tempId,
      content,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      isOptimistic: true // Flag to identify locally added messages
    };
    
    // Update local state immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Pass to parent component to handle the actual sending
    if (onSendMessage) {
      onSendMessage(content, tempId);
    }
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    // Your typing logic here
  };

  // Format date for showing day separators
  const formatDateHeader = (date) => {
    const options = { weekday: 'long' };
    return date.toLocaleDateString('fr-FR', options).toUpperCase();
  };

  // Group messages by date
  const getMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toDateString();
  };

  const messagesByDate = messages.reduce((acc, message) => {
    const date = getMessageDate(message.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  return (
    <div className="conversation-container d-flex flex-column" style={{ height: '300px' }}>
      <div className="d-flex align-items-center p-2 border-bottom" style={{ backgroundColor: '#FFFFFF' }}>
        <button 
          className="btn btn-sm btn-link text-dark p-0 mr-2"
          onClick={handleChatBack}
          style={{ border: 'none' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="position-relative mr-2">
          {selectedContact.avatar ? (
            <img 
              src={selectedContact.avatar} 
              alt="avatar" 
              className="rounded-circle" 
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#0073B1',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {(selectedContact.fullName?.charAt(0) || selectedContact.name?.charAt(0) || '?').toUpperCase()}
            </div>
          )}
          {/* Online status dot */}
          {selectedContact.isOnline && (
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#057642',
                border: '2px solid white',
                borderRadius: '50%',
                position: 'absolute',
                bottom: '0',
                right: '0'
              }}
            />
          )}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {selectedContact.fullName || selectedContact.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666666' }}>
            {selectedContact.isOnline ? 'Disponible sur mobile' : 'Hors ligne'}
          </div>
        </div>
      </div>

      <div 
        className="messages-container flex-grow-1 p-3" 
        style={{ 
          overflowY: 'auto',
          backgroundColor: '#F9F9F9',
          paddingBottom: '60px'
        }}
      >
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date}>
            <div 
              className="text-center my-3" 
              style={{ position: 'relative' }}
            >
              <hr style={{ margin: '10px 0' }} />
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: '#F9F9F9',
                  padding: '0 8px',
                  color: '#666666',
                  fontSize: '12px'
                }}
              >
                {formatDateHeader(new Date(date))}
              </span>
            </div>
            
            {dateMessages.map((msg, index) => (
              <MessageBubble 
                key={msg._id || index}
                message={msg}
                isCurrentUser={currentUser && msg.sender._id === currentUser._id}
                showSender={
                  index === 0 || 
                  dateMessages[index - 1]?.sender?._id !== msg.sender?._id
                }
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers[currentConversationId]?.length > 0 && (
          <TypingIndicator 
            typingUsers={typingUsers} 
            currentConversationId={currentConversationId}
            selectedContact={selectedContact}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input component now integrated in MessageArea */}
      <MessageInput
        sendMessage={sendMessage}
        handleTyping={handleTyping}
      />
    </div>
  );
};

export default MessageArea;