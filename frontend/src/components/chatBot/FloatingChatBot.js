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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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
    setShowUploadForm(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const toggleUploadForm = () => {
    setShowUploadForm(!showUploadForm);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
    if (e.target.files[0] && !uploadTitle) {
      // Set title based on filename without extension
      const fileName = e.target.files[0].name;
      const title = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setUploadTitle(title);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      addMessage("bot", "Please select a file to upload.");
      return;
    }

    if (!userContext || !userContext.businessId) {
      addMessage("bot", "Missing business information. Please try again later.");
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('title', uploadTitle || uploadFile.name);
    formData.append('businessId', userContext.businessId);

    try {
      setIsUploading(true);
      
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data && response.data.documentId) {
        addMessage("bot", `Document "${uploadTitle || uploadFile.name}" uploaded successfully! I can now answer questions based on its content.`);
        setShowUploadForm(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadProgress(0);
      } else {
        addMessage("bot", "There was an issue with the upload. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      addMessage("bot", `Upload failed: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
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
            <div className="chat-actions">
              <button className="upload-button" onClick={toggleUploadForm} title="Upload Document">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </button>
              <button className="close-button" onClick={toggleChat}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {showUploadForm ? (
            <div className="upload-form-container">
              <h4>Upload Document</h4>
              <p className="upload-info">Upload PDF or TXT files that the assistant can use to answer your questions.</p>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-group">
                  <label htmlFor="document-title">Document Title:</label>
                  <input
                    type="text"
                    id="document-title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="document-file">File (PDF/TXT):</label>
                  <div className="file-input-wrapper">
                    <button 
                      type="button" 
                      className="file-input-button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Choose File
                    </button>
                    <span className="file-name">
                      {uploadFile ? uploadFile.name : 'No file chosen'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="document-file"
                      onChange={handleFileChange}
                      accept=".pdf,.txt"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                
                {isUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{uploadProgress}%</span>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={toggleUploadForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="upload-submit-button"
                    disabled={!uploadFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChatBot;