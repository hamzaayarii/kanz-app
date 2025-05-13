import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media,
  Button,
} from "reactstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import debounce from "lodash/debounce";
import { useTTS } from '../TTS/TTSContext';
import HoverSpeakText from '../TTS/HoverSpeakText';
import TTSButton from '../TTS/TTSButton';
import "../TTS/button.css";
const NotificationDropdown = lazy(() => import("../notification/NotificationDropDown"));

const AdminNavbar = ({ brandText, userData }) => {
  const { isTTSEnabled, toggleTTS } = useTTS();
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  const navigate = useNavigate();
  const [state, setState] = useState({
    business: null,
    user: null,
    showBusinessDropdown: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded._id;
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, businessRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${userId}`, { headers }),
        axios.get("http://localhost:5000/api/business/user-businesses", { headers }),
      ]);

      setState((prev) => ({
        ...prev,
        user: userRes.data.user || null,
        business: businessRes.data.businesses?.[0] || userData?.business || null,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [userData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = useCallback((e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    navigate("/auth/login", { replace: true });
  }, [navigate]);

  const toggleBusinessDropdown = useMemo(
    () =>
      debounce(() => {
        setState((prev) => ({ ...prev, showBusinessDropdown: !prev.showBusinessDropdown }));
      }, 200),
    []
  );

  const navigateToBusiness = useCallback(
    (businessId) => {
      navigate(`/admin/business-management/${businessId}`);
      setState((prev) => ({ ...prev, showBusinessDropdown: false }));
    },
    [navigate]
  );

  const redirectToBusinessRegistration = useCallback(() => {
    navigate("/standalone/business-registration");
    setState((prev) => ({ ...prev, showBusinessDropdown: false }));
  }, [navigate]);

  const BusinessDropdown = useMemo(
    () =>
      ({ isOpen, business, onNavigate, onRegister }) =>
        isOpen && (
          <div
            className="position-absolute bg-white rounded shadow-lg py-2"
            style={{ top: "100%", right: 0, zIndex: 1000, minWidth: "200px" }}
          >
            {business && (
              <div className="px-3 py-2" onClick={() => onNavigate(business._id)}>
                <HoverSpeakText textToSpeak={`Select business ${business.name}`}>
                  <div className="font-weight-bold">{business.name}</div>
                  <div className="text-muted small">{business.type}</div>
                </HoverSpeakText>
              </div>
            )}
            <div className="border-top mt-2 pt-2 px-3">
              <HoverSpeakText textToSpeak="Add New Business">
                <Link to="/standalone/business-registration" className="text-primary d-block py-1" onClick={onRegister}>
                  <i className="ni ni-fat-add mr-2"></i> Add New Business
                </Link>
              </HoverSpeakText>
              <HoverSpeakText textToSpeak="Manage Businesses">
                <Link to="/admin/business-management" className="text-primary d-block py-1">
                  <i className="ni ni-settings mr-2"></i> Manage Businesses
                </Link>
              </HoverSpeakText>
            </div>
          </div>
        ),
    []
  );

  return (
    <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main" style={{ zIndex: 2000, position: "relative" }}>
      <Container fluid>
        <HoverSpeakText textToSpeak="Navigate to dashboard">
          <Link className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block" to="/">
            {brandText}
          </Link>
        </HoverSpeakText>
        {isTTSEnabled && (
          <TTSButton
            elementId="navbar-main"
            className="ml-2"
            size="sm"
            label="Read all navigation bar information"
          />
        )}
        <Nav className="align-items-center d-none d-md-flex" navbar>
          {state.user && state.user.role !== 'accountant' && (
            <div className="business-selector mr-4 position-relative">
              <HoverSpeakText textToSpeak={state.business ? `Select business ${state.business.name}` : "Select Business"}>
                <Button
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={toggleBusinessDropdown}
                  aria-label={state.business ? `Select business ${state.business.name}` : "Select Business"}
                >
                  <i className="ni ni-building mr-2"></i>
                  <span className="mr-2">{state.business ? state.business.name : "Select Business"}</span>
                  <i className={`ni ni-bold-${state.showBusinessDropdown ? "up" : "down"}`}></i>
                </Button>
              </HoverSpeakText>
              <BusinessDropdown
                isOpen={state.showBusinessDropdown}
                business={state.business}
                onNavigate={navigateToBusiness}
                onRegister={redirectToBusinessRegistration}
              />
            </div>
          )}

          <HoverSpeakText textToSpeak={isTTSEnabled ? "Disable Text to Speech" : "Enable Text to Speech"}>
            <Button
              className={`tts-toggle-button mr-3 ${isTTSEnabled ? "active" : ""}`}
              color="link"
              onClick={toggleTTS}
              aria-label={isTTSEnabled ? "Disable Text to Speech" : "Enable Text to Speech"}
              style={{
                border: "none",
                background: "none",
                fontSize: "1.7rem",
                color: isTTSEnabled ? "#2dce89" : "#adb5bd",
                position: "relative",
                transition: "color 0.3s ease",
                padding: 0
              }}
            >
              <i 
                className={`fas fa-ear-listen ${isTTSEnabled ? "tts-glow" : ""}`} 
                style={{ background: "transparent" }}
              />
              {isTTSEnabled && (
                <span
                  style={{
                    position: "absolute",
                    top: "-0.5rem",
                    right: "-0.5rem",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#2dce89",
                    boxShadow: "0 0 10px rgba(45, 206, 137, 0.9)",
                  }}
                />
              )}
            </Button>
          </HoverSpeakText>

          <Suspense fallback={<HoverSpeakText>Loading notifications...</HoverSpeakText>}>
            <NotificationDropdown />
          </Suspense>
          <UncontrolledDropdown nav>
            <HoverSpeakText textToSpeak={`User menu for ${state.user?.name || "user"}`}>
              <DropdownToggle className="pr-0" nav aria-label={`User menu for ${state.user?.name || "user"}`}>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="Profile"
                      src={state.user?.avatar || require("../../assets/img/theme/team-1-800x800.jpg")}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">{state.user?.name || ""}</span>
                  </Media>
                </Media>
              </DropdownToggle>
            </HoverSpeakText>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">
                  <HoverSpeakText>Welcome!</HoverSpeakText>
                </h6>
              </DropdownItem>
              {[
                { to: "/admin/user-profile", icon: "ni ni-single-02", text: "My profile" },
                { to: "/admin/user-profile", icon: "ni ni-settings-gear-65", text: "Settings" },
                { to: "/admin/user-profile", icon: "ni ni-calendar-grid-58", text: "Activity" },
                { to: "/admin/user-profile", icon: "ni ni-support-16", text: "Support" },
              ].map(({ to, icon, text }) => (
                <DropdownItem to={to} tag={Link} key={text}>
                  <i className={icon} />
                  <HoverSpeakText>{text}</HoverSpeakText>
                </DropdownItem>
              ))}
              <DropdownItem divider />
              <DropdownItem onClick={handleLogout}>
                <i className="ni ni-user-run" />
                <HoverSpeakText>Logout</HoverSpeakText>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;