import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";
import Header from "components/Headers/Header.js";

const BusinessList = ({ businesses }) => {
  return (
    <div>
      <h1>Your Registered Businesses</h1>
      {businesses.length === 0 ? (
        <p>You haven't registered any businesses yet.</p>
      ) : (
        <ul>
          {businesses.map((business, index) => (
            <li key={business._id || index}>
              {business.name} - {business.type} - {business.address}
              {business.taxNumber && ` - Tax Number: ${business.taxNumber}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const BusinessRegistration = () => {
  const [businesses, setBusinesses] = useState([]);
  const [showBusinesses, setShowBusinesses] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set up axios with auth token
  const authToken = localStorage.getItem('token'); // Assuming you store the token in localStorage
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

  const fetchUserBusinesses = () => {
    setLoading(true);
    setError("");

    axios.get("http://localhost:5000/api/businesses/user")
      .then(response => {
        if (response.data.status) {
          setBusinesses(response.data.businesses);
        } else {
          setError("Failed to fetch businesses");
        }
      })
      .catch(error => {
        console.error("Error fetching businesses!", error);
        setError("Failed to fetch businesses. " + (error.response?.data?.errorMessage || error.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserBusinesses();
  }, []);

  const handleRegisterBusiness = () => {
    setShowRegistrationForm(!showRegistrationForm);
  };

  const handleShowBusinesses = () => {
    setShowBusinesses(!showBusinesses);
    if (!showBusinesses) {
      fetchUserBusinesses();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newBusiness = {
      name,
      type,
      address,
      taxNumber,
      phone
    };

    axios.post("http://localhost:5000/api/businesses", newBusiness)
      .then(response => {
        if (response.data.status) {
          console.log("Business registered:", response.data);
          setBusinesses([...businesses, response.data.business]);
          // Reset form
          setShowRegistrationForm(false);
          setName("");
          setType("");
          setAddress("");
          setTaxNumber("");
          setPhone("");
          // Show success feedback
          alert("Business registered successfully!");
        } else {
          setError(response.data.errorMessage || "Failed to register business");
        }
      })
      .catch(error => {
        console.error("Error registering business!", error);
        setError("Failed to register business. " + (error.response?.data?.errorMessage || error.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <div className="p-4">
                <Button color="primary" onClick={handleRegisterBusiness}>
                  {showRegistrationForm ? "Cancel Registration" : "Register Business"}
                </Button>
                <Button color="secondary" onClick={handleShowBusinesses} className="ml-2">
                  {showBusinesses ? "Hide Businesses" : "Show Businesses"}
                </Button>
              </div>

              {error && (
                <div className="p-4 text-danger">
                  Error: {error}
                </div>
              )}

              {showRegistrationForm && (
                <div className="p-4">
                  <h3>Register a New Business</h3>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="name">Business Name</Label>
                      <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="type">Business Type</Label>
                      <Input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="taxNumber">Tax Number</Label>
                      <Input type="text" id="taxNumber" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="address">Address</Label>
                      <Input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="phone">Phone (Optional)</Label>
                      <Input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </FormGroup>
                    <Button type="submit" color="primary" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </Form>
                </div>
              )}

              {showBusinesses && (
                <div className="p-4">
                  {loading ? (
                    <p>Loading businesses...</p>
                  ) : (
                    <BusinessList businesses={businesses} />
                  )}
                </div>
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default BusinessRegistration;