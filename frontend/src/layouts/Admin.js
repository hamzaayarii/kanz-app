import React, { useState, useEffect } from 'react';
import { useLocation, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'reactstrap';
import AdminNavbar from 'components/Navbars/AdminNavbar.js';
import AdminFooter from 'components/Footers/AdminFooter.js';
import Sidebar from 'components/Sidebar/Sidebar.js';
import ChatWindow from 'components/SocketMessenger/ChatWindow.jsx';
import routes from 'routes.js';
import ChatbotWindow from 'components/generativeChatbot/ChatbotWindow';

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  // State to track the current page title
  const [brandText, setBrandText] = useState('');

  // Effect to scroll to top when location changes
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
  }, [location]);

  // Effect to update the title based on URL path
  useEffect(() => {
    const updateBrandText = () => {
      let currentBrandText = '';
      const { pathname } = location;
      
      // First, handle collapsible menu items by checking all nested routes
      for (let route of routes) {
        // Check if this is a collapsible menu with nested views
        if (route.collapse && route.views) {
          for (let view of route.views) {
            if (view.layout + view.path === pathname) {
              currentBrandText = view.name;
              break;
            }
          }
        } 
        // Check for direct routes
        else if (route.layout + route.path === pathname) {
          currentBrandText = route.name;
          break;
        }
      }
      
      // Store the title in localStorage to persist on page refresh
      if (currentBrandText) {
        localStorage.setItem('currentPageTitle', currentBrandText);
        setBrandText(currentBrandText);
      } else {
        // If no match found in routes, use the stored title or default
        const storedTitle = localStorage.getItem('currentPageTitle');
        setBrandText(storedTitle || 'Dashboard');
      }
    };

    updateBrandText();
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === '/admin') {
        return (
          <Route
            path={prop.path}
            element={isAuthenticated ? prop.component : <Navigate to="/auth/login" replace />}
            key={key}
            exact
          />
        );
      } else {
        return null;
      }
    });
  };

  // Function to handle sidebar link clicks
  const handleSidebarLinkClick = (name) => {
    setBrandText(name);
    localStorage.setItem('currentPageTitle', name);
  };

  // Inject custom styles for ChatbotWindow via CSS
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS rules to override component styles
    style.textContent = `
      /* Target the ChatbotWindow component and its internal elements */
      .chatbot-window-wrapper {
        height: 500px !important;
        max-height: 500px !important;
      }
      
      /* Target any chat container inside ChatbotWindow */
      .chatbot-window-wrapper .chat-container, 
      .chatbot-window-wrapper .messages-container,
      .chatbot-window-wrapper .conversation-container {
        height: 450px !important;
        max-height: 450px !important;
      }
      
      /* Make ChatWindow smaller if needed */
      .chat-window-container {
        height: 300px !important;
        max-height: 300px !important;
      }
    `;
    
    // Append to head
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/logoo.png"),
          imgAlt: "Kanz Logo"
        }}
        onLinkClick={handleSidebarLinkClick}
        location={location}
      />
      <div className="main-content" ref={mainContent}>
        <AdminNavbar {...props} brandText={brandText} />
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
        
        {/* Apply class for styling via our CSS injection */}
        <div className="chatbot-window-wrapper" style={{
        position: 'fixed',
bottom: '20px',
left: '20px',
        }}>
          <ChatbotWindow />
        </div>
      
        {/* Only render ChatWindow if authenticated - positioned far away from ChatbotWindow */}
        {isAuthenticated && (
          <div className="chat-window-container" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px', /* Position it on the opposite side of the screen */
            zIndex: 999,
            height: '300px',
            width: '350px'
          }}>
            <ChatWindow />
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;