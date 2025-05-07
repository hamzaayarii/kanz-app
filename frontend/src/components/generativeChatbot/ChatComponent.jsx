import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: 'Hello! I can help with accounting questions. Ask me anything!',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/rag/chat', { question: text });
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: response.data.answer,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, something went wrong.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div className="message-content">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;