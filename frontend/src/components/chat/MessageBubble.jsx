import React from 'react';

const MessageBubble = ({ message, isCurrentUser, showSender = true }) => {
  if (!message || !message.sender) return null;

  // Format time to display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`d-flex mb-2 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
      {!isCurrentUser && showSender && (
        <div style={{ marginRight: '8px', minWidth: '32px' }}>
          {message.sender.avatar ? (
            <img 
              src={message.sender.avatar} 
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
              {(message.sender.fullName?.charAt(0) || message.sender.name?.charAt(0) || '?').toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      {!isCurrentUser && !showSender && <div style={{ width: '40px' }}></div>}

      <div style={{
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: isCurrentUser ? '#FFFFFF' : '#FFFFFF',
        border: isCurrentUser ? '1px solid #EBEBEB' : '1px solid #EBEBEB',
        marginBottom: '4px'
      }}>
        {message.content === "" ? (
          <span style={{ color: '#666666', fontSize: '12px', fontStyle: 'italic' }}>
            {isCurrentUser ? "Vous" : message.sender.fullName || message.sender.name} {isCurrentUser ? "avez" : "a"} envoyé un message vide
          </span>
        ) : (
          <div>
            {!isCurrentUser && showSender && (
              <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '4px' }}>
                {message.sender.fullName || message.sender.name}
              </div>
            )}
            <span style={{ fontSize: '14px' }}>{message.content}</span>
          </div>
        )}
        <div style={{
          fontSize: '11px',
          color: '#666666',
          marginTop: '4px',
          textAlign: 'right'
        }}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;