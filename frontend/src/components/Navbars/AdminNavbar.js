import { Link, useNavigate } from "react-router-dom";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
  Button,
} from "reactstrap";
import { useState, useEffect } from "react";

const AdminNavbar = (props) => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

  // Fetch business data - update this according to your API structure
  useEffect(() => {
    // Example: If your user data already contains business info
    if (props.userData && props.userData.business) {
      setBusiness(props.userData.business);
    } else {
      // Or fetch it separately if needed
      fetchUserBusiness();
    }
  }, [props.userData]);

  // Function to fetch user's business data
  const fetchUserBusiness = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/business/buisnessowner", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setBusiness(data.business);
      }
    } catch (error) {
      console.error("Error fetching business:", error);
    }
  };
  const handleLogout = (e) => {
    e.preventDefault();
    // Clear user session or authentication token here
    // For example, if you are using localStorage:
    localStorage.removeItem("authToken");

    // Redirect to login page and replace the current history entry
    navigate("/auth/login", { replace: true });
  };


  const toggleBusinessDropdown = () => {
    setShowBusinessDropdown(!showBusinessDropdown);
  };

  const navigateToBusiness = (businessId) => {
    navigate(`/admin/business-management/${businessId}`);
    setShowBusinessDropdown(false);
  };

  const redirectToBusinessRegistration = () => {
    navigate("/standalone/business-registration");
    setShowBusinessDropdown(false);
  };


  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>


            {/* Business Selector */}
            <div className="business-selector mr-4 position-relative">
              <Button
                color="primary"
                className="d-flex align-items-center"
                onClick={toggleBusinessDropdown}
              >
                <i className="ni ni-building mr-2"></i>
                <span className="mr-2">
                  {business ? business.name : "Select Business"}
                </span>
                <i className={`ni ni-bold-${showBusinessDropdown ? 'up' : 'down'}`}></i>
              </Button>

              {/* Business Dropdown */}
              {showBusinessDropdown && (
                <div className="position-absolute bg-white rounded shadow-lg py-2"
                  style={{ top: "100%", right: 0, zIndex: 1000, minWidth: "200px" }}>
                  {/* If user has multiple businesses, map through them here */}
                  {business && (
                    <div
                      className="px-3 py-2 cursor-pointer hover-bg-light"
                      onClick={() => navigateToBusiness(business._id)}
                    >
                      <div className="font-weight-bold">{business.name}</div>
                      <div className="text-muted small">{business.type}</div>
                    </div>
                  )}
                  <div className="border-top mt-2 pt-2 px-3">
                    <Link to="/standalone/business-registration" className="text-primary d-block py-1">
                      <i className="ni ni-fat-add mr-2"></i> Add New Business
                    </Link>
                    <Link to="/admin/business-management" className="text-primary d-block py-1">
                      <i className="ni ni-settings mr-2"></i> Manage Businesses
                    </Link>
                  </div>
                </div>
              )}
            </div>



            {/* User Profile Dropdown */}
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={props.profilePic}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome!</h6>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>My profile</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-settings-gear-65" />
                  <span>Settings</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-calendar-grid-58" />
                  <span>Activity</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-support-16" />
                  <span>Support</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="#pablo" onClick={handleLogout}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
