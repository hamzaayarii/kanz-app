/*eslint-disable*/
import { useState, useEffect } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useTTS } from "../TTS/TTSContext";

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  const [collapseStates, setCollapseStates] = useState({});
  const [user, setUser] = useState(null);
  const { speak } = useTTS();

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded._id;

        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Toggle collapse for a specific section
  const toggleSectionCollapse = (stateName) => {
    setCollapseStates((prev) => ({
      ...prev,
      [stateName]: !prev[stateName],
    }));
  };

  // Verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  // Toggles collapse between opened and closed (true/false)
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };

  // Closes the collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  // Creates the links that appear in the left menu / Sidebar
  const createLinks = (routes) => {
    return routes
      .filter((route) => {
        if (user && user.role === "admin") {
          return true;
        }
        if (typeof route.showInSidebar === "function") {
          return route.showInSidebar(user);
        }
        return route.showInSidebar !== false;
      })
      .map((prop, key) => {
        if (prop.collapse && prop.views) {
          // Handle collapsible sections (e.g., Finances, Invoice)
          return (
            <NavItem key={key}>
              <NavLink
                href="#pablo"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSectionCollapse(prop.state);
                  speak(prop.name);
                }}
                onMouseEnter={() => speak(prop.name)}
                className="d-flex align-items-center"
              >
                <i className={prop.icon} />
                <span className="flex-grow-1">{prop.name}</span>
                <i
                  className={
                    collapseStates[prop.state]
                      ? "ni ni-bold-down arrow-icon"
                      : "ni ni-bold-right arrow-icon"
                  }
                />
              </NavLink>
              <Collapse isOpen={collapseStates[prop.state]}>
                <Nav className="nav-sm">
                  {prop.views
                    .filter((view) => {
                      if (user && user.role === "admin") return true;
                      if (typeof view.showInSidebar === "function") {
                        return view.showInSidebar(user);
                      }
                      return view.showInSidebar !== false;
                    })
                    .map((view, viewKey) => (
                      <NavItem key={viewKey}>
                        <NavLink
                          to={view.layout + view.path}
                          tag={NavLinkRRD}
                          onClick={closeCollapse}
                          onMouseEnter={() => speak(view.name)}
                          activeClassName="active"
                        >
                          <i className={view.icon} />
                          {view.name}
                        </NavLink>
                      </NavItem>
                    ))}
                </Nav>
              </Collapse>
            </NavItem>
          );
        } else {
          // Handle non-collapsible routes
          return (
            <NavItem key={key}>
              <NavLink
                to={prop.layout + prop.path}
                tag={NavLinkRRD}
                onClick={closeCollapse}
                onMouseEnter={() => speak(prop.name)}
                activeClassName="active"
              >
                <i className={prop.icon} />
                {prop.name}
              </NavLink>
            </NavItem>
          );
        }
      });
  };

  const { bgColor, routes, logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>
        {/* Brand */}
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
               style={{ height: "350px", width: "800px" }}
            />
          </NavbarBrand>
        ) : null}
        {/* User */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="Profile"
                    src={
                      user?.avatar ||
                      require("../../assets/img/theme/team-1-800x800.jpg")
                    }
                  />
                </span>
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
              <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>
                <i className="ni ni-user-run" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          {/* Form */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>
          {/* Navigation */}
          <Nav navbar>{createLinks(routes)}</Nav>
          {/* Divider */}
          <hr className="my-3" />
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;