import React from 'react';
import { useLocation, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'reactstrap';
import AdminNavbar from 'components/Navbars/AdminNavbar.js';
import AdminFooter from 'components/Footers/AdminFooter.js';
import Sidebar from 'components/Sidebar/Sidebar.js';
import ChatWindow from 'components/SocketMessenger/ChatWindow.jsx'; // Import the ChatWindow component
import routes from 'routes.js';
import FloatingChatBot from 'components/BasicChatBot/FloatingChatBot';
import AssistantPanel from 'components/generativeChatbot/AssistantPanel';

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check if the user is authenticated

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
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

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/kanz.png"),
          imgAlt: "Kanz Logo"
        }}
      />
      <div className="main-content" ref={mainContent}>
        <AdminNavbar {...props} brandText="" />
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
         {/* simple chat bot component */}
         {isAuthenticated && <FloatingChatBot userContext={{ role: 'business_owner', businessName: 'Your Company' }} />}

         {/* rag chat-bot */}
         {isAuthenticated && <AssistantPanel />}

        {/*  m */}
        {isAuthenticated && <ChatWindow />}
      </div>
    </>
  );
};

export default Admin;