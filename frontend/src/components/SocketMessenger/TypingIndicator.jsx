import React from 'react';

const TypingIndicator = ({ typingUsers, currentConversationId, selectedContact }) => {
  const usersTyping = typingUsers[currentConversationId] || [];

  return usersTyping.length > 0 ? (
    <div className="d-flex mb-2 justify-content-start align-items-end">
      <div style={{ marginRight: '8px', minWidth: '32px' }}>
        {selectedContact.avatar ? (
          <img 
            src={selectedContact.avatar} 
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
            {(selectedContact.fullName?.charAt(0) || selectedContact.name?.charAt(0) || '?').toUpperCase()}
          </div>
        )}
      </div>
      
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: '18px 18px 18px 2px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EBEBEB',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        fontSize: '14px',
        color: '#666',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ marginRight: '8px', fontSize: '13px' }}>
          {(selectedContact.fullName || selectedContact.name || 'Someone')} is typing
        </span>
        <div className="typing-dots" style={{ display: 'inline-flex' }}>
          <span className="dot" style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: '#8E54E9',
            margin: '0 1px',
            animation: 'typingAnimation 1.4s infinite both',
            animationDelay: '0s'
          }}></span>
          <span className="dot" style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: '#8E54E9',
            margin: '0 1px',
            animation: 'typingAnimation 1.4s infinite both',
            animationDelay: '0.2s'
          }}></span>
          <span className="dot" style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: '#8E54E9',
            margin: '0 1px',
            animation: 'typingAnimation 1.4s infinite both',
            animationDelay: '0.4s'
          }}></span>
        </div>
      </div>
      <style>
        {`
          @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
        `}
      </style>
    </div>
  ) : null;
};

export default TypingIndicator;
