// src/components/Chat/ChatWindow.jsx
import React, { useState } from 'react';
import { Card } from 'reactstrap';

import ChatHeader from './ChatHeader';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';

import useSocket from './hooks/useSocket';
import useConversations from './hooks/useConversations';
import useMessages from './hooks/useMessages';

const ChatWindow = ({ currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Custom hooks
  const { socket } = useSocket();
  
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversationId,
    fetchConversations,
    createOrGetConversation,
    deleteConversation 
  } = useConversations(socket);
  
  const { 
    messages, 
    sendMessage, 
    typingUsers,
    handleTyping 
  } = useMessages(socket, currentConversationId, currentUser);

  const toggleChat = () => setIsExpanded(!isExpanded);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const res = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        setSearchResults([]);
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSearchResults(data);
      } else if (data.users && Array.isArray(data.users)) {
        setSearchResults(data.users);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    }
  };

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    setIsSearching(false);
    setSearchQuery('');
    await createOrGetConversation(contact);
  };

  const handleChatBack = () => {
    setSelectedContact(null);
    setCurrentConversationId(null);
  };

  const chatHeight = isExpanded ? '520px' : '48px';

  return (
    <div className="floating-chat" style={{ 
      position: 'fixed', 
      bottom: '20px',
      right: '20px', 
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <Card className="shadow" style={{ 
        width: isExpanded ? '360px' : '220px', 
        height: chatHeight, 
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <ChatHeader toggleChat={toggleChat} isExpanded={isExpanded} />

        {isExpanded && (
          <div style={{
            height: 'calc(100% - 48px)',
            position: 'relative',
            animation: 'fadeIn 0.3s ease'
          }}>
            <SearchBar 
              searchQuery={searchQuery}
              handleSearch={handleSearch}
            />

            {selectedContact ? (
              <>
                <MessageArea 
                  selectedContact={selectedContact}
                  messages={messages}
                  currentUser={currentUser}
                  typingUsers={typingUsers}
                  currentConversationId={currentConversationId} 
                  handleChatBack={handleChatBack}
                />
                <MessageInput 
                  sendMessage={sendMessage}
                  handleTyping={handleTyping}
                />
              </>
            ) : (
              <ConversationList 
                conversations={conversations}
                isSearching={isSearching}
                searchResults={searchResults}
                selectContact={selectContact}
                deleteConversation={deleteConversation}
              />
            )}
          </div>
        )}
      </Card>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatWindow;