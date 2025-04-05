import React from 'react';

const ChatMessage = ({ message }) => {
  const isCurrentUser = message.sender === 'user'; // Replace with proper user checking
  
  return (
    <div className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex-shrink-0">
          <img src="/avatar.png" alt="Avatar" className="w-full h-full rounded-full" />
        </div>
      )}
      <div 
        className={`max-w-3/4 p-3 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        } ${message.pending ? 'opacity-70' : ''} ${message.failed ? 'bg-red-100 border border-red-300' : ''}`}
      >
        {message.content}
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.pending && ' • Sending'}
          {message.failed && ' • Failed'}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;