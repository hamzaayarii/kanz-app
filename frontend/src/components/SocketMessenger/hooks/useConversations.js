import { useState, useEffect } from 'react';

const useConversations = (socket) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (!socket) return;
    fetchConversations();
  }, [socket]);

  // Update conversations when receiving messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      setConversations(prev => prev.map(conv =>
        conv._id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage }
          : conv
      ));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const createOrGetConversation = async (contact) => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ participantId: contact._id })
      });
      const { conversationId } = await res.json();
      setCurrentConversationId(conversationId);
      
      // Join conversation socket room
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }

      const messagesRes = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      const messagesData = await messagesRes.json();

      const newConversation = {
        _id: conversationId,
        participants: [contact],
        participant: contact, // To maintain compatibility with current data structure
        lastMessage: messagesData.length > 0 ? messagesData[messagesData.length - 1] : null,
      };

      setConversations(prev => {
        const conversationExists = prev.some(conv => conv._id === conversationId);
        if (!conversationExists) {
          return [newConversation, ...prev];
        }
        return prev;
      });

      return messagesData;
    } catch (err) {
      console.error('Error selecting contact:', err);
      return [];
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
  
      if (res.ok) {
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        if (conversationId === currentConversationId) {
          setCurrentConversationId(null);
        }
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    fetchConversations,
    createOrGetConversation,
    deleteConversation
  };
};

export default useConversations;