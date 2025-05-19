import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentPageTitle");
    // Add any other cleanup if needed
    navigate("/auth/login", { replace: true });
  }, [navigate]);
  return null;
};

export default Logout;