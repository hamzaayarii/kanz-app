import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = 'http://localhost:5000/api/rag';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const chatEndRef = useRef(null);

  // Scroll to bottom automatically when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format the time
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Component to display an individual message
// Inside ChatComponent.jsx
const MessageBubble = ({ message }) => {
    const isUser = message.role === 'role';
  
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-[70%] px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="prose">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime()}
          </div>
        </div>
      </div>
    );
  };

  // Component to display sources
  const SourcesList = () => {
    if (sources.length === 0) return null;

    return (
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources consultées :</h3>
        <ul className="text-xs text-gray-600">
          {sources.map((source, index) => (
            <li key={index} className="mb-1">
              <span className="font-medium">{source.fileName}</span>
              {source.category && <span> ({source.category})</span>}
              <span className="ml-2 text-gray-500">
                Pertinence: {Math.round(source.relevance * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Reset input
    setInput('');
    setError(null);
    setSources([]);

    try {
      setIsLoading(true);

      // Send question to backend
      const response = await axios.post(`${API_URL}/chat`, { question: userMessage.content });

      if (response.data.success) {
        const botMessage = { role: 'assistant', content: response.data.answer };
        setMessages((prev) => [...prev, botMessage]);

        // Store sources if available
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">Assistant Comptable Virtuel</h2>
              <p>Posez vos questions concernant la comptabilité des PME tunisiennes</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">{error}</div>
              </div>
            )}
            <SourcesList />
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Posez votre question comptable..."
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-blue-500 text-white px-4 py-2 rounded-r-lg ${
              isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;