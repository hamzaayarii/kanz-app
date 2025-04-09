import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'react-feather';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageArea = ({ 
  selectedContact, 
  messages, 
  currentUser, 
  typingUsers,
  currentConversationId,
  handleChatBack 
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get date for showing day separators
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
    </div>
  );
};

export default MessageArea;