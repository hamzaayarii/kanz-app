import { useState, useRef, useCallback } from 'react';

const useTyping = (socket) => {
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTypingEvent = useCallback(({ conversationId, userId, isTyping }) => {
    setTypingUsers(prev => {
      const currentTyping = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: isTyping 
          ? [...currentTyping.filter(id => id !== userId), userId]
          : currentTyping.filter(id => id !== userId)
      };
    });
  }, []);

  const emitTyping = (conversationId) => {
    if (!socket) return;

    if (!isTyping) {
      socket.emit('typing', {
        conversationId,
        isTyping: true
      });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId,
        isTyping: false
      });
      setIsTyping(false);
    }, 2000);
  };

  return {
    typingUsers,
    handleTypingEvent,
    emitTyping
  };
};

export default useTyping;