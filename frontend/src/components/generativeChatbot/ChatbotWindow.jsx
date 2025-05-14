import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = 'http://localhost:5000/api/rag';

const ChatbotWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [documentCount, setDocumentCount] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Toggle chat window with animation
  const toggleChatWindow = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      if (messages.length === 0) {
        setTimeout(() => {
          setMessages([
            { 
              role: 'assistant', 
              content: 'Hello! I\'m your AI accounting assistant. How can I help you with financial matters today?',
              timestamp: new Date()
            }
          ]);
        }, 300);
      }
    } else {
      setIsOpen(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Fetch document stats on mount
  useEffect(() => {
    fetchDocumentStats();
  }, []);

  // Scroll to bottom for chat messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDocumentStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      if (response.data.success) {
        setDocumentCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Format time for messages
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // MessageBubble component
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`message-container ${isUser ? 'user-message' : 'ai-message'}`}>
        {!isUser && (
          <div className="ai-avatar">
            <div className="ai-avatar-inner">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M8 10C8 11.1 7.1 12 6 12C4.9 12 4 11.1 4 10C4 8.9 4.9 8 6 8C7.1 8 8 8.9 8 10Z" fill="currentColor"/>
                <path d="M20 10C20 11.1 19.1 12 18 12C16.9 12 16 11.1 16 10C16 8.9 16.9 8 18 8C19.1 8 20 8.9 20 10Z" fill="currentColor"/>
                <path d="M15.5 15.5C14.67 16.33 13.33 16.33 12.5 15.5C11.67 14.67 10.33 14.67 9.5 15.5L8.09 14.09C9.5 12.68 11.5 12.68 12.91 14.09L15.5 16.5L18.09 13.91C19.5 12.5 21.5 12.5 22.91 13.91L15.5 15.5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
          <div className="message-content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div className="message-time">
            {formatTime(message.timestamp || new Date())}
          </div>
        </div>
        {isUser && (
          <div className="user-avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
    );
  };

  // SourcesList component
  const SourcesList = () => {
    if (sources.length === 0) return null;
    return (
      <div className="sources-container">
        <div className="sources-header">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
          </svg>
          <span>Knowledge Sources</span>
        </div>
        <div className="sources-list">
          {sources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-meta">
                <span className="source-name">{source.fileName}</span>
                {source.category && <span className="source-category">{source.category}</span>}
              </div>
              <div className="source-relevance">
                <div className="relevance-bar" style={{ width: `${Math.round(source.relevance * 100)}%` }}></div>
                <span>{Math.round(source.relevance * 100)}% relevant</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Chat input handling
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };


  // Add this component to your file
const AnimatedRobotLogo = ({ isSpeaking = true }) => {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Robot head - Changed from blue to teal-green */}
      <rect x="12" y="8" width="24" height="30" rx="4" fill="#4DB6AC" className="robot-head">
        <animate attributeName="fill" values="#4DB6AC;#26A69A;#4DB6AC" dur="4s" repeatCount="indefinite" />
      </rect>
      
      {/* Eyes (kept same) */}
      <circle cx="22" cy="20" r="3" fill="white">
        <animate attributeName="cy" values="20;18;20" dur="1s" repeatCount="indefinite" begin={isSpeaking ? "0s" : "indefinite"} />
      </circle>
      <circle cx="26" cy="20" r="3" fill="white">
        <animate attributeName="cy" values="20;18;20" dur="1s" repeatCount="indefinite" begin={isSpeaking ? "0.2s" : "indefinite"} />
      </circle>
      
      {/* Eye pupils (kept same) */}
      <circle cx="22" cy="20" r="1.5" fill="#1a1a2e">
        <animate attributeName="cx" values="22;21;22;23;22" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="26" cy="20" r="1.5" fill="#1a1a2e">
        <animate attributeName="cx" values="26;25;26;27;26" dur="5s" repeatCount="indefinite" />
      </circle>
      
      {/* Antenna (kept purple) */}
      <line x1="24" y1="8" x2="24" y2="4" stroke="#BA68C8" strokeWidth="2">
        <animate attributeName="y2" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx="24" cy="4" r="2" fill="#BA68C8">
        <animate attributeName="fill" values="#BA68C8;#f72585;#BA68C8" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Mouth (kept same) */}
      {isSpeaking ? (
        <path d="M18 28 Q24 32 30 28" stroke="white" strokeWidth="2" fill="none">
          <animate attributeName="d" values="M18 28 Q24 32 30 28; M18 28 Q24 36 30 28; M18 28 Q24 32 30 28" dur="0.5s" repeatCount="indefinite" />
        </path>
      ) : (
        <path d="M18 28 Q24 26 30 28" stroke="white" strokeWidth="2" fill="none" />
      )}
      
      {/* Body lines (kept same) */}
      <line x1="16" y1="38" x2="16" y2="42" stroke="white" strokeWidth="2" />
      <line x1="32" y1="38" x2="32" y2="42" stroke="white" strokeWidth="2" />
    </svg>
  );
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setSources([]);
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/chat`, { question: userMessage.content });
      if (response.data.success) {
        const botMessage = { 
          role: 'assistant', 
          content: response.data.answer,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
        if (response.data.sources && response.data.sources.length > 0) {
          setSources(response.data.sources);
        }
      } else {
        setError("Sorry, I couldn't process your request. Please try again.");
      }
    } catch (err) {
      console.error('Error sending question:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Document upload handling
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please select a PDF or TXT file.');
      }
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    try {
      setUploading(true);
      setMessage(null);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      if (category) {
        formData.append('category', category);
      }
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setMessage(`Document "${response.data.fileName}" uploaded and indexed successfully.`);
        setFile(null);
        setCategory('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchDocumentStats();
      } else {
        setError(response.data.message || 'Error uploading document.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetIndex = async () => {
    if (!window.confirm('Are you sure you want to reset the document index? This cannot be undone.')) {
      return;
    }
    try {
      setUploading(true);
      const response = await axios.post(`${API_URL}/reset`);
      if (response.data.success) {
        setMessage('Document index has been reset successfully.');
        setDocumentCount(0);
      } else {
        setError('Error resetting index.');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('An error occurred while resetting the index.');
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
     <div className="floating-chat-button" onClick={toggleChatWindow}>
  <AnimatedRobotLogo />
  <div className="chat-button-pulse"></div>
</div>

      {/* Chat Window */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
  <div className="ai-avatar-small">
    <AnimatedRobotLogo />
  </div>
  <span>Accounting AI</span>
</div>

          <div className="chatbot-controls">
            <button className="control-button minimize" onClick={toggleMinimize}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 14H4V10H20V14Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="control-button close" onClick={toggleChatWindow}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="chatbot-tabs">
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
            </svg>
            <span>Chat</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
            </svg>
            <span>Documents</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="chatbot-content">
          {activeTab === 'chat' ? (
            <>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h3>Accounting AI Assistant</h3>
                    <p>Ask me anything about accounting, taxes, or financial regulations</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageBubble key={index} message={message} />
                    ))}
                    {isLoading && (
                      <div className="typing-indicator">
                        <div className="typing-dots">
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                        <span>AI is thinking...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
                {error && (
                  <div className="error-message">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 15H13V17H11V15ZM11 7H13V13H11V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                <SourcesList />
              </div>
              <form className="chat-input-container" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <input
                    type="text"
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask your accounting question..."
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="send-button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="documents-container">
              <div className="documents-header">
                <h3>Knowledge Base</h3>
                {documentCount !== null && (
                  <div className="document-count">
                    <span>{documentCount} document chunks indexed</span>
                  </div>
                )}
              </div>
              
              <form className="upload-form" onSubmit={handleUpload}>
                <div className="file-upload">
                  <label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      accept=".pdf,.txt,application/pdf,text/plain"
                      disabled={uploading}
                    />
                    <div className="upload-area">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                      </svg>
                      <span>{file ? file.name : 'Select PDF or TXT file'}</span>
                    </div>
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Category (optional)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={handleCategoryChange}
                    placeholder="e.g. taxes, regulations, etc."
                    disabled={uploading}
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="upload-button"
                  >
                    {uploading ? 'Processing...' : 'Upload & Index'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetIndex}
                    disabled={uploading || documentCount === 0}
                    className="reset-button"
                  >
                    Reset Knowledge
                  </button>
                </div>
              </form>
              
              {message && (
                <div className="success-message">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                  </svg>
                  <span>{message}</span>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 15H13V17H11V15ZM11 7H13V13H11V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="instructions">
                <h4>How to use:</h4>
                <ol>
                  <li>Upload PDF/TXT documents with financial data</li>
                  <li>Organize with categories for better retrieval</li>
                  <li>Chat with the AI about your documents</li>
                  <li>Reset the knowledge base when needed</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        :root {
          --primary-color: #4361ee;
          --primary-light: #4895ef;
          --secondary-color: #3f37c9;
          --accent-color: #4cc9f0;
          --dark-color: #1a1a2e;
          --light-color: #f8f9fa;
          --success-color: #4bb543;
          --error-color: #ff3333;
          --warning-color: #ffb347;
          --text-color: #333;
          --text-light: #777;
          --border-color: #e0e0e0;
          --shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          --border-radius: 12px;
          --transition: all 0.3s ease;
        }

        /* Floating Chat Button */
        .floating-chat-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow);
          z-index: 1000;
          transition: var(--transition);
        }

        .floating-chat-button:hover {
          background: var(--secondary-color);
          transform: scale(1.1);
        }

        .floating-chat-button.active {
          background: var(--secondary-color);
        }

        .chat-button-icon {
          width: 24px;
          height: 24px;
          color: white;
          z-index: 2;
        }

        .chat-button-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          border-radius: 50%;
          opacity: 0.7;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* Chatbot Container */
        .chatbot-container {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(20px);
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
          z-index: 999;
        }

        .chatbot-container.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .chatbot-container.minimized {
          height: 60px;
        }

        /* Chatbot Header */
        .chatbot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: var(--primary-color);
          color: white;
        }

        .chatbot-title {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 16px;
        }

        .ai-avatar-small {
          width: 24px;
          height: 24px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-controls {
          display: flex;
          gap: 10px;
        }

        .control-button {
          background: none;
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.8;
          transition: var(--transition);
          border-radius: 4px;
        }

        .control-button:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }

        /* Tabs */
        .chatbot-tabs {
          display: flex;
          background: #f5f5f5;
          padding: 0 20px;
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-light);
          transition: var(--transition);
        }

        .tab-button svg {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }

        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
          font-weight: 500;
        }

        /* Content Area */
        .chatbot-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Messages Container */
        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-light);
        }

        .empty-state-icon {
          width: 60px;
          height: 60px;
          margin-bottom: 15px;
          color: var(--primary-light);
        }

        .empty-state h3 {
          margin-bottom: 10px;
          color: var(--text-color);
        }

        /* Message Styles */
        .message-container {
          display: flex;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-message {
          justify-content: flex-end;
        }

        .ai-message {
          justify-content: flex-start;
        }

        .ai-avatar, .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .ai-avatar {
          background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
          color: white;
          margin-right: 12px;
        }

        .ai-avatar-inner {
          width: 24px;
          height: 24px;
        }

        .user-avatar {
          background: #e0e0e0;
          color: #666;
          margin-left: 12px;
        }

        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: var(--transition);
        }

        .ai-bubble {
          background: #f5f7fb;
          color: var(--text-color);
          border-bottom-left-radius: 4px;
        }

        .user-bubble {
          background: var(--primary-color);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-content {
          line-height: 1.5;
          font-size: 14px;
        }

        .message-content :global(p) {
          margin: 0 0 8px 0;
        }

        .message-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .message-time {
          font-size: 11px;
          margin-top: 4px;
          text-align: right;
          opacity: 0.8;
        }

        .user-bubble .message-time {
          color: rgba(255, 255, 255, 0.8);
        }

        .ai-bubble .message-time {
          color: var(--text-light);
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          padding: 8px 16px;
          background: #f5f7fb;
          border-radius: 18px;
          width: fit-content;
          border-bottom-left-radius: 4px;
        }

        .typing-dots {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }

        .typing-dots div {
          width: 8px;
          height: 8px;
          background: var(--primary-light);
          border-radius: 50%;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-dots div:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots div:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
        }

        /* Chat Input */
        .chat-input-container {
          padding: 15px 20px;
          border-top: 1px solid var(--border-color);
          background: white;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 24px;
          padding: 8px 12px;
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .send-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .send-button svg {
          width: 18px;
          height: 18px;
        }

        /* Sources Container */
        .sources-container {
          margin-top: 20px;
          background: #f9f9f9;
          border-radius: var(--border-radius);
          padding: 15px;
          border: 1px solid var(--border-color);
          animation: fadeIn 0.3s ease-out;
        }

        .sources-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-color);
        }

        .sources-header svg {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          color: var(--primary-light);
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .source-item {
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .source-meta {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .source-name {
          font-weight: 500;
          color: var(--text-color);
        }

        .source-category {
          margin-left: 8px;
          padding: 2px 6px;
          background: #e0e8ff;
          color: var(--primary-color);
          border-radius: 4px;
          font-size: 11px;
        }

        .source-relevance {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: var(--text-light);
        }

        .relevance-bar {
          height: 4px;
          background: linear-gradient(90deg, var(--primary-light), var(--primary-color));
          border-radius: 2px;
          margin-right: 8px;
          width: 0;
          transition: width 0.5s ease;
        }

        /* Documents Tab */
        .documents-container {
          padding: 20px;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .documents-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .documents-header h3 {
          margin: 0;
          font-size: 16px;
          color: var(--text-color);
        }

        .document-count {
          font-size: 12px;
          color: var(--text-light);
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
        }

        /* File Upload */
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .file-upload {
          position: relative;
        }

        .file-upload input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          cursor: pointer;
        }

        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius);
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: var(--transition);
        }

        .file-upload:hover .upload-area {
          border-color: var(--primary-light);
          background: #f8faff;
        }

        .upload-area svg {
          width: 24px;
          height: 24px;
          margin-bottom: 10px;
          color: var(--primary-light);
        }

        .upload-area span {
          font-size: 14px;
          color: var(--text-light);
        }

        /* Form Elements */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          color: var(--text-color);
          font-weight: 500;
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          transition: var(--transition);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .upload-button, .reset-button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .upload-button {
          background: var(--primary-color);
          color: white;
        }

        .upload-button:hover:not(:disabled) {
          background: var(--secondary-color);
        }

        .upload-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .reset-button {
          background: #f5f5f5;
          color: var(--text-color);
          border: 1px solid var(--border-color);
        }

        .reset-button:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .reset-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Messages */
        .success-message, .error-message {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 15px;
          animation: fadeIn 0.3s ease-out;
        }

        .success-message {
          background: rgba(75, 181, 67, 0.1);
          color: var(--success-color);
        }

        .error-message {
          background: rgba(255, 51, 51, 0.1);
          color: var(--error-color);
        }

        .success-message svg, .error-message svg {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }

        /* Instructions */
        .instructions {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .instructions h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-color);
        }

        .instructions ol {
          padding-left: 20px;
          margin: 0;
          font-size: 13px;
          color: var(--text-light);
          line-height: 1.6;
        }
          /* Robot animation enhancements */
.robot-head {
  transition: all 0.3s ease;
}

.floating-chat-button:hover .robot-head {
  transform: rotate(5deg);
}

.ai-avatar-small svg {
  width: 24px;
  height: 24px;
}

.ai-avatar svg {
  width: 36px;
  height: 36px;
}

/* Breathing animation when idle */
@keyframes robotBreath {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.chatbot-container:not(.open) .floating-chat-button svg {
  animation: robotBreath 3s ease-in-out infinite;
}

        .instructions li {
          margin-bottom: 6px;
        }
      `}</style>
    </>
  );
};

export default ChatbotWindow;