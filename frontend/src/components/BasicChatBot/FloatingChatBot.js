import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./FloatingChatBot.css";
import backgroundImage from './bg.png';
import logo from './chatbot.png';

const FloatingChatBot = ({ userContext }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const options = [
    { id: 1, text: "Track my order/shipment" },
    { id: 2, text: "Update my account information" },
    { id: 3, text: "Resolve a payment issue" },
    { id: 4, text: "Find a specific product" }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("bot", "Hi! 👋 Need help? Tell me what's going on or choose an option below!");
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, timestamp: new Date() }]);
  };

  const sendMessage = async (messageText = input.trim()) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    setInput("");
    setLoading(true);

    if (!userContext || !userContext.role || !userContext.businessName) {
      console.error("User context is missing required fields.");
      addMessage("bot", "Sorry, something went wrong.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/chatBot/ask", {
        message: trimmed,
        userContext: {
          role: userContext.role,
          businessName: userContext.businessName,
          businessId: userContext.businessId,
        },
      });

      if (res.data && res.data.reply) {
        addMessage("bot", res.data.reply);
      } else {
        addMessage("bot", "Sorry, something went wrong.");
      }
    } catch (err) {
      addMessage("bot", "Sorry, something went wrong.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    sendMessage(option.text);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="floating-chatbot">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="chat-toggle-button"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <div className="chat-avatar-icon">
              <img src={logo} alt="Chatbot" />
            </div>
            <span className="chat-toggle-text">Need Assistance?</span>
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div 
          className="chat-window"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <div className="chat-header">
            <div className="chat-title">
              <div className="chat-avatar">
                <img src={logo} alt="Chatbot Logo" />
              </div>
              <h3>Customer Support Assistant</h3>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.sender === "bot" ? (
                  <>
                    <div className="message-content">{message.text}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </>
                ) : (
                  <div className="message-content">{message.text}</div>
                )}
              </div>
            ))}

            {messages.length === 1 && messages[0].sender === "bot" && (
              <div className="options-container">
                {options.map(option => (
                  <button
                    key={option.id}
                    className="option-button"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatBot;