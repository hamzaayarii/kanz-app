// ConversationItem.jsx
import React from 'react';

const ConversationItem = ({ conversation, onSelect }) => {
  return (
    <div 
      key={conversation._id}
      className="contact-item d-flex p-2 border-bottom" 
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(conversation.participant)}
    >
      <img 
        src={conversation?.participant?.avatar || 'default-avatar.jpg'} 
        alt={conversation?.participant?.fullName || 'No Name'} 
        className="avatar" 
      />
      <div className="ml-2">
        <strong>{conversation?.participant?.fullName || 'No Name'}</strong>
        <p>{conversation?.lastMessage?.content || 'No message'}</p>
      </div>
    </div>
  );
};

export default ConversationItem;
