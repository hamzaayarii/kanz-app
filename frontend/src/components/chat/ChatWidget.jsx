import React from 'react';
import { ChatProvider } from '../../context/ChatContext';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  return (
    <ChatProvider>
      <ChatButton />
      <ChatWindow />
    </ChatProvider>
  );
};

export default ChatWidget;
