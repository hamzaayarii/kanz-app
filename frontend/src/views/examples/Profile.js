import React, { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardBody, FormGroup, Form, Input, Container, Row, Col } from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import axios from "axios";
import {jwtDecode} from 'jwt-decode';

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    governorate: "",
    avatar: "",
    gender: "",
    _id: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Get token from localStorage
        if (!token) {
          throw new Error("User not authenticated. Please log in again.");
        }

        // Decode token to get user ID
        const decoded = jwtDecode(token);
        const userId = decoded._id;
        console.log("User ID from token:", userId);

        // Fetch user data from API with token in headers
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || !response.data.user) {
          throw new Error("Invalid API response. User data not found.");
        }

        setUser(response.data.user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle input field changes
  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["currentPassword", "newPassword", "confirmPassword"].includes(name)) {
      setPasswords(prev => ({ ...prev, [name]: value }));
      
      // Validate password fields
      if (name === "newPassword") {
        const passwordError = validatePassword(value);
        setPasswordErrors(prev => ({
          ...prev,
          newPassword: passwordError,
          confirmPassword: value !== passwords.confirmPassword ? "Passwords do not match" : ""
        }));
      } else if (name === "confirmPassword") {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: value !== passwords.newPassword ? "Passwords do not match" : ""
        }));
      }
    } else {
      setUser((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the limit of 5MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      alert("Only JPEG, PNG, and GIF files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prevState) => ({ ...prevState, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("User not authenticated. Please log in again.");
        return;
      }

      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decoded.exp < currentTime) {
        alert("Your session has expired. Please log in again.");
        return;
      }

      // Ensure user._id is available
      if (!user._id) {
        alert("User ID is missing!");
        return;
      }

      // Check if password update is requested
      if (passwords.newPassword) {
        // Validate password fields
        const newPasswordError = validatePassword(passwords.newPassword);
        if (newPasswordError) {
          setError(newPasswordError);
          return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          setError("New password and confirm password do not match!");
          return;
        }
        if (!passwords.currentPassword) {
          setError("Current password is required to update password");
          return;
        }
      }

      // Send the updated user data to the backend API URL
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        ...user,
        ...(passwords.newPassword ? {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        } : {})
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response && err.response.status === 401) {
        alert("Unauthorized access. Please log in again.");
      } else {
        setError(err.message || "Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) return <div className="text-center">Loading...</div>;

  // Render error state
  if (error) return <div className="text-center">{error}</div>;

  return (
      <>
        <AdminNavbar profilePic={user.avatar} userName={user.fullName} />
        <UserHeader userName={user.fullName} profilePicture={user.avatar} />
        <Container className="mt--7" fluid>
          <Row>
            <Col className="order-xl-1" xl="8">
              <Card className="bg-secondary shadow">
                <CardHeader className="bg-white border-0">
                  <Row className="align-items-center">
                    <Col xs="8">
                      <h3 className="mb-0">My Account</h3>
                    </Col>
                    <Col className="text-right" xs="4">
                      <Button color="primary" onClick={handleSubmit} size="sm">
                        Save Changes
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <h6 className="heading-small text-muted mb-4">User Information</h6>
                    <div className="pl-lg-4">
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Full Name</label>
                            <Input
                                type="text"
                                name="fullName"
                                value={user.fullName}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Email</label>
                            <Input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Phone Number</label>
                            <Input
                                type="text"
                                name="phoneNumber"
                                value={user.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Governorate</label>
                            <Input
                                type="text"
                                name="governorate"
                                value={user.governorate}
                                onChange={handleChange}
                                placeholder="Governorate"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Gender</label>
                            <Input
                                type="select"
                                name="gender"
                                value={user.gender}
                                onChange={handleChange}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Password Update Section */}
                      <Row>
                        <Col lg="12">
                          <h6 className="heading-small text-muted mb-4">Password Update</h6>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <label className="form-control-label">Current Password</label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handleChange}
                                placeholder="Current Password"
                                invalid={!!passwordErrors.currentPassword}
                            />
                            {passwordErrors.currentPassword && (
                              <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {passwordErrors.currentPassword}
                              </div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <label className="form-control-label">New Password</label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                placeholder="New Password"
                                invalid={!!passwordErrors.newPassword}
                            />
                            {passwordErrors.newPassword && (
                              <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {passwordErrors.newPassword}
                              </div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <label className="form-control-label">Confirm New Password</label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm New Password"
                                invalid={!!passwordErrors.confirmPassword}
                            />
                            {passwordErrors.confirmPassword && (
                              <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {passwordErrors.confirmPassword}
                              </div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Profile Picture Upload */}
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Profile Picture</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePicChange}
                            />
                            {user.avatar && (
                                <img src={user.avatar} alt="Profile" width="100px" />
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
  );
};

export default Profile;
