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
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle chat window with animation
  const toggleChatWindow = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Add welcome message when opening for the first time if no messages
      if (messages.length === 0) {
        setTimeout(() => {
          setMessages([
            { 
              role: 'assistant', 
              content: 'Bonjour ! Je suis votre assistant comptable virtuel. Comment puis-je vous aider aujourd\'hui avec vos questions de comptabilité ?' 
            }
          ]);
        }, 300);
      }
    } else {
      setIsOpen(false);
    }
  };

  // Fetch document stats on mount
  useEffect(() => {
    fetchDocumentStats();
  }, []);

  // Scroll to bottom for chat messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  // Format time for messages
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // MessageBubble component
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-3 fade-in-up`}>
        {!isUser && (
          <div className="avatar avatar-sm rounded-circle bg-gradient-primary text-white mr-2 d-flex align-items-center justify-content-center" 
            style={{ 
              width: '40px', 
              height: '40px', 
              marginRight: '8px',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
            <i className="ni ni-bulb-61"></i>
          </div>
        )}
        <div
          className={`${isUser ? 'bg-gradient-primary text-white' : 'bg-secondary bg-opacity-25 text-dark'}`}
          style={{
            maxWidth: '75%',
            padding: '12px 16px',
            borderRadius: '18px',
            borderBottomRightRadius: isUser ? '4px' : '18px',
            borderBottomLeftRadius: isUser ? '18px' : '4px',
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="prose">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div 
            className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-muted'}`}
            style={{ fontSize: '0.75rem' }}
          >
            {formatTime()}
          </div>
        </div>
        {isUser && (
          <div className="avatar avatar-sm rounded-circle bg-gradient-info text-white ml-2 d-flex align-items-center justify-content-center" 
            style={{ 
              width: '40px', 
              height: '40px', 
              marginLeft: '8px',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
            <i className="ni ni-circle-08"></i>
          </div>
        )}
      </div>
    );
  };

  // SourcesList component
  const SourcesList = () => {
    if (sources.length === 0) return null;
    return (
      <div className="mt-3 p-3 bg-secondary bg-opacity-10 rounded">
        <h3 className="text-sm font-weight-bold text-muted mb-2">Sources consultées :</h3>
        <ul className="text-xs text-muted pl-3">
          {sources.map((source, index) => (
            <li key={index} className="mb-1">
              <span className="font-weight-medium">{source.fileName}</span>
              {source.category && <span> ({source.category})</span>}
              <span className="ml-2 text-muted">
                Pertinence: {Math.round(source.relevance * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Chat input handling
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setSources([]);
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/chat`, { question: userMessage.content });
      if (response.data.success) {
        const botMessage = { role: 'assistant', content: response.data.answer };
        setMessages((prev) => [...prev, botMessage]);
        if (response.data.sources && response.data.sources.length > 0) {
          setSources(response.data.sources);
        }
      } else {
        setError("Désolé, je n'ai pas pu traiter votre demande.");
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la question:', err);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
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
        setError('Format de fichier non supporté. Veuillez sélectionner un fichier PDF ou TXT.');
      }
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier à télécharger.');
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
        setMessage(`Document "${response.data.fileName}" téléchargé et indexé avec succès.`);
        setFile(null);
        setCategory('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchDocumentStats();
      } else {
        setError(response.data.message || 'Erreur lors du téléchargement du document.');
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Une erreur est survenue lors du téléchargement. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetIndex = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser l\'index de documents ? Cette action est irréversible.')) {
      return;
    }
    try {
      setUploading(true);
      const response = await axios.post(`${API_URL}/reset`);
      if (response.data.success) {
        setMessage('L\'index de documents a été réinitialisé avec succès.');
        setDocumentCount(0);
      } else {
        setError('Erreur lors de la réinitialisation de l\'index.');
      }
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setError('Une erreur est survenue lors de la réinitialisation de l\'index.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChatWindow}
        className="btn btn-primary btn-icon-only rounded-circle position-fixed chat-btn-pulse"
        style={{
          bottom: '20px',
          right: '20px',
          zIndex: 1050,
          width: '60px',
          height: '60px',
          boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <i className="ni ni-chat-round" style={{ fontSize: '1.5rem' }}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="position-fixed bg-white rounded shadow-lg d-flex flex-column overflow-hidden"
          style={{
            bottom: '80px',
            right: '20px',
            width: '360px',
            height: '500px',
            zIndex: 1050,
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          {/* Header with Tabs */}
          <div className="bg-gradient-primary d-flex justify-content-between align-items-center px-3 py-3">
            <div className="d-flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`btn btn-sm ${
                  activeTab === 'chat'
                    ? 'btn-white'
                    : 'btn-link text-white'
                } mr-2 tab-btn-animate`}
              >
                <i className="ni ni-chat-round mr-1"></i> Chat
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`btn btn-sm ${
                  activeTab === 'documents'
                    ? 'btn-white'
                    : 'btn-link text-white'
                } tab-btn-animate`}
              >
                <i className="ni ni-folder-17 mr-1"></i> Documents
              </button>
            </div>
            <div className="d-flex align-items-center">
              <span className="text-white font-weight-bold mr-2">Assistant Kanz</span>
              <button
                onClick={toggleChatWindow}
                className="btn btn-link text-white btn-sm p-1"
              >
                <i className="ni ni-fat-remove"></i>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow-1 overflow-auto p-3">
            {activeTab === 'chat' ? (
              <div className="d-flex flex-column h-100">
                <div className="flex-grow-1 overflow-auto bg-secondary bg-opacity-10 rounded p-3" style={{ minHeight: '360px' }}>
                  {messages.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <div className="text-center text-muted">
                        <h2 className="h4 font-weight-bold mb-2">
                          Assistant Comptable Virtuel
                        </h2>
                        <p>Posez vos questions concernant la comptabilité des PME tunisiennes</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                      ))}
                      {isLoading && (
                        <div className="d-flex justify-content-start mb-3 fade-in-up">
                          <div className="avatar avatar-sm rounded-circle bg-gradient-primary text-white mr-2 d-flex align-items-center justify-content-center" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              marginRight: '8px',
                              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                            }}>
                            <i className="ni ni-bulb-61"></i>
                          </div>
                          <div 
                            className="bg-secondary bg-opacity-25 text-dark d-flex align-items-center"
                            style={{
                              padding: '12px 20px',
                              borderRadius: '18px',
                              borderBottomLeftRadius: '4px',
                              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      )}
                      {error && (
                        <div className="d-flex justify-content-center mb-3">
                          <div className="alert alert-danger py-2 px-3 mb-0">
                            {error}
                          </div>
                        </div>
                      )}
                      <SourcesList />
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>
                <div className="bg-white mt-3">
                  <form onSubmit={handleSubmit} className="d-flex">
                    <div className="input-group input-group-merge input-group-alternative shadow-sm flex-grow-1">
                      <div className="input-group-prepend">
                        <span className="input-group-text bg-white border-right-0">
                          <i className="ni ni-bulb-61 text-primary"></i>
                        </span>
                      </div>
                      <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="form-control bg-white border-left-0"
                        placeholder="Posez votre question comptable..."
                        style={{ boxShadow: 'none' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={`btn btn-primary ml-2 d-flex align-items-center send-btn-animate ${
                        isLoading || !input.trim() ? 'opacity-50' : ''
                      }`}
                    >
                      <i className="ni ni-send"></i>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white h-100 overflow-auto">
                <h2 className="h4 font-weight-bold mb-3">Gestion des documents</h2>
                {documentCount !== null && (
                  <div className="alert alert-info py-2 px-3">
                    <p className="mb-0">
                      <span className="font-weight-bold">{documentCount}</span> chunks de documents indexés
                    </p>
                  </div>
                )}
                <form onSubmit={handleUpload} className="mb-3">
                  <div className="form-group">
                    <label className="form-control-label">
                      Document (PDF ou TXT)
                    </label>
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="customFile"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        accept=".pdf,.txt,application/pdf,text/plain"
                        disabled={uploading}
                      />
                      <label className="custom-file-label" htmlFor="customFile">
                        {file ? file.name : 'Choisir un fichier'}
                      </label>
                    </div>
                    {file && (
                      <small className="form-text text-muted">
                        Taille: {(file.size / 1024).toFixed(2)} KB
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-control-label">
                      Catégorie (optionnel)
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={handleCategoryChange}
                      placeholder="Ex: comptabilité, fiscalité, etc."
                      className="form-control"
                      disabled={uploading}
                    />
                  </div>
                  <div className="d-flex">
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="btn btn-primary mr-2"
                    >
                      {uploading ? 'Téléchargement...' : 'Télécharger et indexer'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetIndex}
                      disabled={uploading || documentCount === 0}
                      className="btn btn-danger"
                    >
                      Réinitialiser l'index
                    </button>
                  </div>
                </form>
                {message && (
                  <div className="alert alert-success">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}
                <div className="mt-3">
                  <h3 className="h5 font-weight-bold">Instructions</h3>
                  <ol className="pl-3 text-muted">
                    <li>Téléchargez des fichiers PDF ou TXT contenant vos données comptables.</li>
                    <li>Optionnellement, assignez une catégorie pour mieux organiser vos documents.</li>
                    <li>Les documents seront automatiquement découpés en chunks et indexés.</li>
                    <li>Vous pouvez poser des questions sur vos documents dans le chat.</li>
                    <li>Pour vider la base de connaissances, utilisez le bouton "Réinitialiser l'index".</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for typing indicators */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: #6c757d;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0.5; }
        }
        
        /* Chat button pulse animation */
        .chat-btn-pulse {
          animation: chat-button-pulse 2s infinite;
          position: relative;
        }
        .chat-btn-pulse:hover {
          animation: none;
          transform: scale(1.1);
        }
        @keyframes chat-button-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(94, 114, 228, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(94, 114, 228, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(94, 114, 228, 0);
          }
        }
        
        /* Chat window animation */
        .chat-window-animate {
          animation: chat-window-fade-in 0.3s ease-out;
          transform-origin: bottom right;
        }
        @keyframes chat-window-fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Message bubbles animations */
        .fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Tab buttons animation */
        .tab-btn-animate {
          transition: all 0.3s ease;
          position: relative;
        }
        .tab-btn-animate:hover {
          transform: translateY(-2px);
        }
        .tab-btn-animate::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #fff;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .tab-btn-animate:hover::after {
          width: 80%;
        }
        
        /* Send button animation */
        .send-btn-animate {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .send-btn-animate:hover {
          transform: translateY(-2px);
        }
        .send-btn-animate:active {
          transform: translateY(1px);
        }
        .send-btn-animate::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transition: all 0.6s;
        }
        .send-btn-animate:hover::before {
          left: 100%;
        }
      `}</style>
    </>
  );
};

export default ChatbotWindow;