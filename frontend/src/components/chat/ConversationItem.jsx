import React from 'react';

const ConversationItem = ({ conversation, selectContact }) => {
  const { participant, lastMessage } = conversation;
  
  // Format date to just show time if today, or date if older
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    
    const messageDate = new Date(dateString);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Short date format like "8 avr."
      return `${messageDate.getDate()} ${messageDate.toLocaleString('fr', { month: 'short' })}`;
    }
  };
  
  return (
    <div
      className="contact-item d-flex p-2 align-items-center"
      style={{ 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        borderBottom: '1px solid #EBEBEB',
        backgroundColor: '#FFFFFF',
        padding: '12px 16px'
      }}
      onClick={selectContact}
    >
      <div className="position-relative mr-2">
        {participant.avatar ? (
          <img
            src={participant.avatar}
            className="rounded-circle"
            alt={participant.fullName || participant.name || 'User'}
            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#0073B1',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {(participant.fullName?.charAt(0) || participant.name?.charAt(0) || '?').toUpperCase()}
          </div>
        )}
        {/* Online status dot */}
        {participant.isOnline && (
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#057642',
              border: '2px solid white',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '2px',
              right: '2px'
            }}
          />
        )}
      </div>
      
      <div style={{ flex: 1 }}>
        <div className="d-flex justify-content-between">
          <div style={{ fontWeight: '500', fontSize: '14px' }}>
            {participant.fullName || participant.name || 'Unknown'}
          </div>
          <small style={{ color: '#666666', fontSize: '12px' }}>
            {formatMessageDate(lastMessage?.createdAt)}
          </small>
        </div>
        <p 
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '250px',
            margin: 0,
            fontSize: '13px',
            color: '#666666'
          }}
        >
          {lastMessage?.content || 'No messages yet'}
        </p>
      </div>
    </div>
  );
};

export default ConversationItem;