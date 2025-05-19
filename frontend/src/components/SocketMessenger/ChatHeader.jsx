import React from 'react';
import { CardHeader } from 'reactstrap';
import { MessageCircle, X, Maximize2, Plus } from 'react-feather';

const ChatHeader = ({ toggleChat, isExpanded }) => {
  return (
    <CardHeader
      className="d-flex justify-content-between align-items-center"
      style={{ 
        background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', // Modern gradient
        color: '#FFFFFF',
        cursor: 'pointer',
        borderBottom: 'none',
        padding: '14px 16px',
        borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
      onClick={toggleChat}
    >
      <div className="d-flex align-items-center">
        <MessageCircle size={18} className="mr-2" style={{ marginRight: '8px' }} />
        <span style={{ 
          fontWeight: '600', 
          fontSize: '16px',
          letterSpacing: '0.2px'
        }}>
          Messaging
        </span>
      </div>
      <div className="d-flex">
        {isExpanded && (
          <>
            <button 
              className="btn btn-sm btn-link p-0 mr-2" 
              style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              onClick={(e) => e.stopPropagation()}
            >
              <Maximize2 size={16} />
            </button>
            <button 
              className="btn btn-sm btn-link p-0 mr-2" 
              style={{ color: 'rgba(255,255,255,0.8)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              onClick={(e) => e.stopPropagation()}
            >
              <Plus size={16} />
            </button>
          </>
        )}
        <button 
          className="btn btn-sm btn-link p-0" 
          style={{ color: 'rgba(255,255,255,0.8)', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
          onClick={(e) => {
            e.stopPropagation();
            toggleChat();
          }}
        >
          <X size={18} />
        </button>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;