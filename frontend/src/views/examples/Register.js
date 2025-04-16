import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Card, CardBody, FormGroup, Form,
  Input, InputGroupAddon, InputGroupText, InputGroup, Col, Label
} from "reactstrap";
import axios from "axios";


const Register = () => {
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    governorate: "",
    avatar: "",
    gender: "Male",
    role: "business_owner"
  });

  // Validation state
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  // Form submission error state
  const [submitError, setSubmitError] = useState(null);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.length < 2) return "Full name must be at least 2 characters";
        return "";
      
      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
      
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        return "";
      
      default:
        return "";
    }
  };

  // Validate form on mount and when formData changes
  useEffect(() => {
    const newErrors = {};
    Object.keys(errors).forEach(field => {
      newErrors[field] = validateField(field, formData[field]);
    });
    setErrors(newErrors);
  }, [formData]);
  const auth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/googleAuthRequest', {
        method: 'POST',  // Or 'GET' depending on the request type
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anything: "taktak" }), // Only for POST or PUT requests
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data from the backend');
      }

      const data = await response.json();
      console.log(data);

      // Ensure data has a valid URL
      if (data.url) {

        //window.location.href = data.url;
        window.open(data.url, "_blank", "width=500,height=600");
        window.addEventListener("message", (event) => {
          if (event.origin !== "http://127.0.0.1:5000") return; // Security check
          localStorage.setItem("authToken", event.data.token);
          localStorage.setItem('user', JSON.stringify(event.data.user));
          navigate('/admin/index');
        }, { once: true });
      } else {
        console.error('No URL returned from the backend');
      }
    } catch (error) {
      console.error('Error:', error);
    }

  }


  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    let newErrors = {};
    Object.keys(formData).forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/api/users/register', formData);
        
        if (response.data.success) {
            // Store email for verification resending
            localStorage.setItem('pendingVerificationEmail', formData.email);
            
            // Show success message
            setSubmitError(null);
            alert('Registration successful! Please check your email to verify your account.');
            navigate('/auth/login');
        }
    } catch (error) {
        setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Sign up with</small>
          </div>
          <Form role="form" onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-1">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-hat-3" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  invalid={!!errors.fullName}
                />
              </InputGroup>
              {errors.fullName && (
                <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.fullName}
                </div>
              )}
            </FormGroup>

            {/* Email Input */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-1">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-email-83" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  invalid={!!errors.email}
                />
              </InputGroup>
              {errors.email && (
                <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.email}
                </div>
              )}
            </FormGroup>

            {/* Password Input */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-1">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  invalid={!!errors.password}
                />
              </InputGroup>
              {errors.password && (
                <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.password}
                </div>
              )}
            </FormGroup>


            {/* Role Selection (Radio Buttons) */}
            <FormGroup>
              <Label className="form-control-label">Select Role:</Label>
              <div>
                <FormGroup check inline>
                  <Input
                    type="radio"
                    name="role"
                    value="accountant"
                    checked={formData.role === "accountant"}
                    onChange={handleChange}
                  />
                  <Label check>Accountant</Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input
                    type="radio"
                    name="role"
                    value="business_owner"
                    checked={formData.role === "business_owner"}
                    onChange={handleChange}
                  />
                  <Label check>Business Owner</Label>
                </FormGroup>
              </div>
            </FormGroup>

            {/* Submit Error Message */}
            {submitError && (
              <div className="text-danger text-center mb-3" style={{ fontSize: '0.9rem' }}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <Button className="mt-4" color="primary" type="submit">
                Create account
              </Button>
            </div>

            {/* Google Signup */}
            <div className="text-center mt-4">
              <small className="text-muted">or connect with Google account</small>
            </div>
            <div className="text-center mt-2">
              <Button
                className="btn-neutral btn-icon"
                color="default"
                onClick={auth}
              >
                <span className="btn-inner--icon">
                  <img
                    alt="..."
                    src={require("../../assets/img/icons/common/google.svg").default}
                  />
                </span>
                <span className="btn-inner--text">Google</span>
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Register;
