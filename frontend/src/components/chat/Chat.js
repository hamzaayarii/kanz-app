import React, { useState } from 'react';
import { FaComments, FaSearch, FaTimes, FaEllipsisH, FaPaperPlane } from 'react-icons/fa';

const Messagerie = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Static data for UI demonstration
  const contacts = [
    { id: 1, name: 'John Doe', role: 'Accountant', avatar: 'JD', online: true, lastMessage: 'Hi, I have a question about the latest invoice', unread: 2, time: '10:30 AM' },
    { id: 2, name: 'Sarah Miller', role: 'Accountant', avatar: 'SM', online: false, lastMessage: 'The tax report is ready for review', unread: 0, time: 'Yesterday' },
    { id: 3, name: 'Robert Chen', role: 'Accountant', avatar: 'RC', online: true, lastMessage: 'I need your approval on the transaction', unread: 0, time: '2d' },
  ];

  // Dummy messages for the active chat
  const dummyMessages = [
    { id: 1, senderId: 1, text: 'Hi, I have a question about the latest invoice', time: '10:30 AM' },
    { id: 2, senderId: 'me', text: 'Sure, what do you need to know?', time: '10:32 AM' },
    { id: 3, senderId: 1, text: 'There seems to be a discrepancy in the total amount', time: '10:35 AM' },
    { id: 4, senderId: 1, text: 'Can we schedule a call to discuss?', time: '10:35 AM' },
  ];

  const toggleMessagerie = () => {
    setIsOpen(!isOpen);
    setActiveChat(null);
  };

  const openChat = (contactId) => {
    setActiveChat(contactId);
  };

  const closeChat = () => {
    setActiveChat(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // This would normally send the message, but this is just UI for now
    setMessageInput('');
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="fixed bottom-0 right-6 z-50 flex flex-col items-end">
      {/* Main Messagerie Panel */}
      {isOpen && !activeChat && (
        <div className="bg-white rounded-t-lg shadow-xl border border-gray-200 w-80 mb-2 flex flex-col" style={{ height: '400px' }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Messagerie</h3>
            <div className="flex space-x-3">
              <button className="text-gray-500 hover:text-gray-700">
                <FaEllipsisH />
              </button>
              <button onClick={toggleMessagerie} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className="p-3 border-b">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search messages"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                  onClick={() => openChat(contact.id)}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}>
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <span className="text-xs text-gray-500">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                  
                  {contact.unread > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No messages found
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Individual Chat Panel */}
      {isOpen && activeChat && (
        <div className="bg-white rounded-t-lg shadow-xl border border-gray-200 w-80 mb-2 flex flex-col" style={{ height: '400px' }}>
          <div className="flex items-center p-3 border-b">
            <button onClick={closeChat} className="text-gray-500 hover:text-gray-700 mr-2">
              <FaTimes />
            </button>
            
            {(() => {
              const contact = contacts.find(c => c.id === activeChat);
              return (
                <>
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}>
                      {contact?.avatar}
                    </div>
                    {contact?.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex-1">
                    <p className="font-medium text-sm">{contact?.name}</p>
                    <p className="text-xs text-gray-500">{contact?.role}</p>
                  </div>
                </>
              );
            })()}
            
            <button className="text-gray-500 hover:text-gray-700">
              <FaEllipsisH />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {dummyMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`mb-3 flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.senderId === 'me' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t p-3">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Write a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button 
                type="submit"
                className={`ml-2 text-blue-500 ${!messageInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700'}`}
                disabled={!messageInput.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Messaging Button */}
      <button
        onClick={toggleMessagerie}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors mb-2"
      >
        <FaComments size={24} />
        {!isOpen && contacts.some(c => c.unread > 0) && (
          <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {contacts.reduce((total, contact) => total + contact.unread, 0)}
          </div>
        )}
      </button>
    </div>
  );
};

export default Messagerie;