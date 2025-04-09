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
      </div>
      
      <div style={{
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EBEBEB',
        fontSize: '14px',
        color: '#666',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ marginRight: '8px' }}>
          {(selectedContact.fullName || selectedContact.name || 'Someone')} is typing...
        </span>
        <div className="typing-indicator">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  ) : null;
};

export default TypingIndicator;
