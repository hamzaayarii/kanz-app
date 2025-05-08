import { useState, useEffect, useRef } from 'react';
import useTyping from './useTyping';

const useMessages = (socket, conversationId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const { typingUsers, handleTypingEvent, emitTyping } = useTyping(socket);

  // Socket event listeners for messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Load messages when conversation changes
    const fetchMessages = async () => {
      try {
        const messagesRes = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
          if (!messageExists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleTypingEvent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleTypingEvent);
    };
  }, [socket, conversationId, handleTypingEvent]);

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !conversationId) return;

    // Create a temporary message
    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: messageContent,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      conversationId: conversationId,
      isTemp: true
    };

    // Add to state immediately
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ conversationId: conversationId, content: messageContent })
      });

      const sentMessage = await res.json();
      
      // Replace the temporary message with the real one
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark the message as failed
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? { ...msg, failed: true } : msg)
      );
    }
  };

  const handleTyping = () => {
    if (!conversationId) return;
    emitTyping(conversationId);
  };

  return { 
    messages, 
    sendMessage, 
    typingUsers,
    handleTyping
  };
};

export default useMessages;