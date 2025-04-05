// MessageInput.jsx
import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupText, Input, Button } from 'reactstrap';
import { Paperclip, Send } from 'react-feather';

const MessageInput = ({ message, setMessage, handleSendMessage }) => {
  return (
    <div className="message-input-container d-flex p-2 border-top">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText><Paperclip size={18} /></InputGroupText>
        </InputGroupAddon>
        <Input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message..." 
        />
        <InputGroupAddon addonType="append">
          <Button onClick={handleSendMessage} color="primary"><Send size={18} /></Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default MessageInput;
