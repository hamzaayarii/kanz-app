import React from 'react';
import ConversationItem from './ConversationItem';
import { FaTrashAlt } from 'react-icons/fa';

const ConversationList = ({ 
  conversations, 
  isSearching, 
  searchResults, 
  selectContact,
  deleteConversation // <-- include the prop
}) => {

  const handleDelete = (e, convId) => {
    e.stopPropagation(); // prevent opening the chat
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(convId);
    }
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <div className="text-center p-3" style={{ color: '#666666', fontSize: '14px' }}>No users found</div>;
    }

    return searchResults.map(user => (
      <div 
        key={user._id}
        className="d-flex p-2 border-bottom align-items-center"
        style={{ 
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          backgroundColor: '#FFFFFF',
          padding: '12px 16px'
        }}
        onClick={() => selectContact(user)}
      >
        <div className="position-relative mr-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              className="rounded-circle"
              alt={user.fullName || 'User'}
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
              {(user.fullName?.charAt(0) || '?').toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-2">
          <div style={{ fontWeight: '500', fontSize: '14px' }}>
            {user.fullName || 'Unknown'}
          </div>
          {user.title && <div style={{ fontSize: '13px', color: '#666666' }}>{user.title}</div>}
          {user.email && <div style={{ fontSize: '13px', color: '#666666' }}>{user.email}</div>}
          {user.phoneNumber && <div style={{ fontSize: '13px', color: '#666666' }}>{user.phoneNumber}</div>}
        </div>
      </div>
    ));
  };

  return (
    <div 
      className="contacts-container" 
      style={{ 
        height: '350px', 
        overflowY: 'auto',
        backgroundColor: '#FFFFFF'
      }}
    >
      {isSearching ? (
        renderSearchResults()
      ) : conversations.length > 0 ? (
        conversations.map((conv) => {
          if (!conv || !conv.participant || !conv._id) {
            console.log("Invalid conversation data:", conv);
            return null;
          }

          return (
            <div
              key={conv._id}
              className="d-flex justify-content-between align-items-center border-bottom px-3 py-2"
              style={{ cursor: 'pointer' }}
              onClick={() => selectContact(conv.participant)}
            >
              <ConversationItem conversation={conv} />
              <FaTrashAlt 
                size={14} 
                style={{ color: '#888', marginLeft: '8px' }} 
                onClick={(e) => handleDelete(e, conv._id)}
              />
            </div>
          );
        }).filter(Boolean)
      ) : (
        <div className="text-center p-4" style={{ color: '#666666', fontSize: '14px' }}>No conversations found</div>
      )}
    </div>
  );
};

export default ConversationList;
