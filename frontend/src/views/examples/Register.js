import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Card, CardBody, FormGroup, Form,
  Input, InputGroupAddon, InputGroupText, InputGroup, Col
} from "reactstrap";


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
  });

  // Error state
  const [error, setError] = useState(null);
  const auth = async () => {
      try {
        const response =await fetch('http://localhost:5000/api/users/googleAuthRequest', {
          method: 'POST',  // Or 'GET' depending on the request type
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({anything: "taktak"}), // Only for POST or PUT requests
        })

        if (!response.ok) {
          throw new Error('Failed to fetch data from the backend');
        }

        const data = await response.json();
        console.log(data);

        // Ensure data has a valid URL
        if (data.url) {
          navigate(data.url);
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state before making a request

    // Basic validation for password length
    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.token);

      // Redirect to the dashboard
      navigate("/admin/dashboard");

    } catch (err) {
      // Handle any errors and show the message
      setError(err.message);
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
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-hat-3" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </FormGroup>

            {/* Email Input */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-email-83" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </FormGroup>

            {/* Password Input */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </FormGroup>

            {/* Error Message */}
            {error && <div className="text-danger text-center mb-3">{error}</div>}

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
