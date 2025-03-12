// src/components/BusinessForm.jsx
import React, { useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
} from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BusinessForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organizationName: "",
        organizationLocation: "",
        // Add other necessary business fields
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.post(
                "http://your-api-url/api/business/register",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                // After successful business registration, redirect to dashboard
                navigate("/admin/index");
            }
        } catch (error) {
            console.error("Error registering business:", error);
        }
    };

    return (
        <Container className="mt-7" fluid>
            <Row>
                <Col className="order-xl-1" xl="12">
                    <Card className="bg-secondary shadow">
                        <CardHeader className="bg-white border-0">
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <h3 className="mb-0">Business Registration</h3>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Form onSubmit={handleSubmit}>
                                <div className="pl-lg-4">
                                    <Row>
                                        <Col lg="6">
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="organizationName"
                                                >
                                                    Organization Name*
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    id="organizationName"
                                                    name="organizationName"
                                                    placeholder="Enter your organization name"
                                                    type="text"
                                                    required
                                                    value={formData.organizationName}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col lg="6">
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="organizationLocation"
                                                >
                                                    Organization Location*
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    id="organizationLocation"
                                                    name="organizationLocation"
                                                    placeholder="Enter your organization location"
                                                    type="text"
                                                    required
                                                    value={formData.organizationLocation}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {/* Add more fields as needed */}
                                </div>
                                <div className="text-center mt-4">
                                    <Button color="primary" type="submit">
                                        Let's get started!
                                    </Button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BusinessForm;