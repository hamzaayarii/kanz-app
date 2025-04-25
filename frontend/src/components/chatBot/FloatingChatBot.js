import { useState } from "react";
import axios from "axios";

const FloatingChatBot = ({ userContext }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
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
      const res = await axios.post("http://localhost:5000/api/chatBot/ask", {
        message: trimmed,
        userContext: {
          role: userContext.role,
          businessName: userContext.businessName,
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      addMessage("bot", `Hello! I'm your business assistant for ${userContext?.businessName || 'your business'}. How can I help you with legal, accounting, or tax matters today?`);
    }
  };

  return (
    <div className="floating-chatbot">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg ${isOpen ? "bg-red-500" : "bg-blue-500"} text-white transition-all duration-300`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 flex flex-col">
          <div className="bg-blue-500 text-white p-4">
            <h3 className="font-bold text-lg">Business Assistant</h3>
            <p className="text-sm opacity-80">Legal, Accounting & Tax</p>
          </div>

          <div className="flex-1 p-4 h-80 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 mb-2 rounded-lg ${
                  m.sender === "user"
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100"
                } max-w-[80%] ${m.sender === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-500 italic p-2">Bot is typing...</div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <input
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ask a question..."
              />
                      <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Send
          </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatBot;
