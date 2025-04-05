import React, { createContext, useState, useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
import { getChatHistory, sendMessage as apiSendMessage } from '../services/chatService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = socketIOClient(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Set up event listeners for socket
  useEffect(() => {
    if (!socket) return;

    socket.on('message', (message) => {
      if (activeConversation && message.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, message]);
      }
      
      if (!isOpen || (activeConversation && message.conversationId !== activeConversation._id)) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('conversation_updated', (updatedConvo) => {
      setConversations((prev) => 
        prev.map((convo) => 
          convo._id === updatedConvo._id ? updatedConvo : convo
        )
      );
    });

    return () => {
      socket.off('message');
      socket.off('conversation_updated');
    };
  }, [socket, activeConversation, isOpen]);

  // Load conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };
    
    fetchConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) return;
      
      try {
        const chatHistory = await getChatHistory(activeConversation._id);
        setMessages(chatHistory);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    
    loadMessages();
  }, [activeConversation]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const sendMessage = async (content) => {
    if (!activeConversation) return;
    
    const messageData = {
      conversationId: activeConversation._id,
      content,
      sender: 'user', // Replace with actual user ID
    };
    
    // Optimistically add to UI
    const tempMessage = { ...messageData, _id: Date.now(), pending: true };
    setMessages((prev) => [...prev, tempMessage]);
    
    try {
      const sentMessage = await apiSendMessage(messageData);
      // Replace temp message with actual message from server
      setMessages((prev) => 
        prev.map((msg) => 
          msg._id === tempMessage._id ? sentMessage : msg
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark message as failed
      setMessages((prev) => 
        prev.map((msg) => 
          msg._id === tempMessage._id ? { ...msg, failed: true } : msg
        )
      );
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        messages,
        conversations,
        activeConversation,
        unreadCount,
        toggleChat,
        setActiveConversation,
        sendMessage,
        setIsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
