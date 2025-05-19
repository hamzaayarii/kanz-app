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
              style={{ 
                width: '36px', 
                height: '36px', 
                objectFit: 'cover',
                border: '2px solid #F1F1F1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '36px', 
                height: '36px', 
                background: 'linear-gradient(135deg, #6A82FB 0%, #FC5C7D 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {(message.sender.fullName?.charAt(0) || message.sender.name?.charAt(0) || '?').toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      {!isCurrentUser && !showSender && <div style={{ width: '44px' }}></div>}

      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: isCurrentUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
        backgroundColor: isCurrentUser ? 'linear-gradient(135deg, #6e8efb 0%, #4a6cf7 100%)' : '#FFFFFF',
        background: isCurrentUser ? 'linear-gradient(135deg, #6e8efb 0%, #4a6cf7 100%)' : '#FFFFFF',
        color: isCurrentUser ? '#FFFFFF' : '#333333',
        border: isCurrentUser ? 'none' : '1px solid #EBEBEB',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        marginBottom: '4px',
        position: 'relative',
        transition: 'all 0.2s',
        transform: 'translateY(0)',
        animation: 'fadeIn 0.3s ease',
      }}>
        {message.content === "" ? (
          <span style={{ 
            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#888888', 
            fontSize: '13px', 
            fontStyle: 'italic' 
          }}>
            {isCurrentUser ? "Vous" : message.sender.fullName || message.sender.name} {isCurrentUser ? "avez" : "a"} envoyé un message vide
          </span>
        ) : (
          <div>
            {!isCurrentUser && showSender && (
              <div style={{ 
                fontWeight: '600', 
                fontSize: '13px', 
                marginBottom: '5px',
                color: '#4a6cf7'
              }}>
                {message.sender.fullName || message.sender.name}
              </div>
            )}
            <span style={{ 
              fontSize: '14px',
              lineHeight: '1.4'
            }}>{message.content}</span>
          </div>
        )}
        <div style={{
          fontSize: '11px',
          color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#888888',
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