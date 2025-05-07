// components/chat/AssistantPanel.jsx
import React, { useState } from 'react';
import ChatComponent from './ChatComponent ';
import DocumentUploader from './DocumentUploader';

const AssistantPanel = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          Assistant Comptable pour PME Tunisiennes
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        {activeTab === 'chat' ? (
          <div className="bg-white rounded-lg shadow-md h-full">
            <ChatComponent />
          </div>
        ) : (
          <DocumentUploader />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 py-3 text-center text-gray-500 text-sm">
        Assistant Comptable RAG (Retrieval-Augmented Generation) - Powered by Cohere & Weaviate
      </div>
    </div>
  );
};

export default AssistantPanel;
