import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Import only essential styles immediately
import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Lazy load larger components
const AdminLayout = lazy(() => import("layouts/Admin.js"));
const AuthLayout = lazy(() => import("layouts/Auth.js"));
const StandaloneLayout = lazy(() => import("./views/buisness/StandaloneLayout"));
const BusinessRegistrationGuard = lazy(() => import("./views/buisness/BusinessRegistrationGuard"));
const TTSProvider = lazy(() => import('./components/TTS/TTSProvider.jsx'));

// Loading component for suspense fallback
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

// Dynamically import non-critical styles after component mount
const loadNonCriticalStyles = () => {
  import("assets/scss/argon-dashboard-react.scss");
};

// Call this function after initial render
setTimeout(loadNonCriticalStyles, 100);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <TTSProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <BusinessRegistrationGuard>
                <AdminLayout />
              </BusinessRegistrationGuard>
            }
          />
          <Route path="/auth/*" element={<AuthLayout />} />
          <Route path="/standalone/*" element={<StandaloneLayout />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </TTSProvider>
    </Suspense>
  </BrowserRouter>
);