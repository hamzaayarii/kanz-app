import React from 'react';
import { CardHeader } from 'reactstrap';
import { MessageCircle, X } from 'react-feather';

const ChatHeader = ({ toggleChat, isExpanded }) => {
  return (
    <CardHeader
      className="d-flex justify-content-between align-items-center"
      style={{ 
        backgroundColor: '#1E88E5', // Changed to blue (Material Design blue 600)
        color: '#FFFFFF', // Changed to white
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Lighter border for contrast
        padding: '12px 16px',
        borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
        transition: 'background-color 0.3s ease' // Smooth transition for hover effects
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565C0'} // Darker blue on hover
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E88E5'} // Return to original
    >
      <div className="d-flex align-items-center" onClick={toggleChat}>
        <span style={{ 
          fontWeight: '600', 
          fontSize: '16px',
          color: '#FFFFFF' // Ensure text stays white
        }}>
          Chat</span>
      </div>
      <div className="d-flex">
        {isExpanded && (
          <>
            <button className="btn btn-sm btn-link text-dark p-0 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="16 3 21 3 21 8 16 3"></polygon>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <path d="M21 13v8h-8M4 4v16h8"></path>
              </svg>
            </button>
            <button className="btn btn-sm btn-link text-dark p-0 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </>
        )}
        <button 
          className="btn btn-sm btn-link text-dark p-0" 
          onClick={toggleChat}
        >
          <X size={20} />
        </button>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;