import { useState } from "react";
import axios from "axios";

const ChatBotPage = ({ userContext }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    setInput("");
    setLoading(true);

    // Ensure userContext is being passed correctly
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
          role: userContext.role,  // Pass role and businessName from userContext
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

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Chat with Your Business Assistant</h2>
        
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg ${
                m.sender === "user" 
                  ? "bg-blue-100 ml-auto text-right" 
                  : "bg-gray-100"
              } max-w-[80%] ${m.sender === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div className="font-bold">{m.sender === "user" ? "You" : "Bot"}</div>
              <div>{m.text}</div>
            </div>
          ))}
          
          {loading && (
            <div className="text-sm text-gray-500 italic">Bot is typing...</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask about your business..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-blue-300"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
