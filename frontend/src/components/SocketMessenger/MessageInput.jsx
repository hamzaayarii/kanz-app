import React, { useState } from 'react';
import { Input } from 'reactstrap';
import { Image, Smile, Paperclip, Send, Mic } from 'react-feather';

const MessageInput = ({ sendMessage, handleTyping }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
  };

  return (
    <form 
      onSubmit={handleSend} 
      className="d-flex border-top" 
      style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '12px 16px',
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 10,
        borderTop: '1px solid #F1F1F1',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div className="d-flex align-items-center mr-2">
        <button 
          type="button" 
          className="btn btn-link p-1 text-secondary" 
          style={{ 
            border: 'none',
            opacity: 0.7,
            transition: 'all 0.2s',
            transform: `scale(${isFocused ? '0.9' : '1'})`,
            margin: '0 2px'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          <Paperclip size={18} />
        </button>
        <button 
          type="button" 
          className="btn btn-link p-1 text-secondary" 
          style={{ 
            border: 'none',
            opacity: 0.7,
            transition: 'all 0.2s',
            transform: `scale(${isFocused ? '0.9' : '1'})`,
            margin: '0 2px'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          <Mic size={18} />
        </button>
      </div>
      
      <Input 
        value={message} 
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Type a message..." 
        style={{ 
          border: 'none', 
          borderRadius: '20px',
          backgroundColor: '#F5F5F5',
          padding: '10px 16px',
          fontSize: '14px',
          boxShadow: isFocused ? 'inset 0 0 0 1px #4a6cf7' : 'none',
          transition: 'all 0.2s ease'
        }}
      />
      
      <button 
        type="submit"
        className="btn p-1 ml-2" 
        style={{ 
          border: 'none',
          background: message.trim() ? 'linear-gradient(135deg, #6e8efb 0%, #4a6cf7 100%)' : '#F5F5F5',
          color: message.trim() ? '#FFFFFF' : '#BBBBBB',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          transform: message.trim() ? 'scale(1)' : 'scale(0.95)',
          boxShadow: message.trim() ? '0 2px 8px rgba(106,150,247,0.4)' : 'none'
        }}
        disabled={!message.trim()}
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default MessageInput;