import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    FormFeedback
} from 'reactstrap';

const BusinessRegistrationPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: '',
        taxNumber: '',
        phone: ''
    });


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    // Check if user is authenticated and redirect if they already have a business
    useEffect(() => {
        const fetchBusinesses = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/business/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBusinesses(response.data.businesses);
            } catch (error) {
                console.error('Error fetching businesses:', error);
            }
        };

        fetchBusinesses();
    }, [navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Organization name is required';
        if (!formData.address.trim()) newErrors.address = 'Organization address is required';
        if (!formData.type.trim()) newErrors.type = 'Organization type is required';
        if (!formData.taxNumber.trim()) newErrors.taxNumber = 'Tax number is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/business/register',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setLoading(false);

            if (response.data.success) {
                // After registering a new business, refresh the list and go to dashboard
                navigate('/admin/index');
            } else {
                setErrors({ general: response.data.message || 'Failed to register business' });
            }
        } catch (error) {
            setLoading(false);
            console.error('Business registration error:', error);
            setErrors({
                general: error.response?.data?.message || 'An error occurred during registration'
            });
        }
    };

    return (
        <div className="main-content">
            <div className="header bg-gradient-primary py-7 py-lg-8">
                <Container>
                    <div className="header-body text-center mb-5">
                        <Row className="justify-content-center">
                            <Col lg="8" md="8">
                                <h1 className="text-white">Welcome to Your Business Registration</h1>
                                <p className="text-lead text-white">
                                    Before you can access the dashboard, please register your business.
                                </p>
                            </Col>
                        </Row>
                    </div>

                </Container>

                <div className="separator separator-bottom separator-skew zindex-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                        version="1.1"
                        viewBox="0 0 2560 100"
                        x="0"
                        y="0"
                    >
                        <polygon
                            className="fill-default"
                            points="2560 0 2560 100 0 100"
                        />
                    </svg>
                </div>
            </div>
            <Container className="mt--8 pb-5">
                <Row className="justify-content-center">
                    <Col lg="6" md="8">
                        <Card className="bg-secondary shadow border-0">
                            <CardHeader className="bg-transparent d-flex justify-content-start align-items-center">
                                <Button
                                    color="primary"
                                    onClick={() => window.location.href = "/admin/index"}
                                    className="btn-sm"
                                >
                                    <i className="fas fa-arrow-left me-2"></i> Back to Dashboard
                                </Button>
                                <div className="text-center flex-grow-1">
                                    <h3>Business Registration</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="px-lg-5 py-lg-5">
                                {errors.general && (
                                    <div className="text-center mb-3">
                                        <small className="text-danger">{errors.general}</small>
                                    </div>
                                )}
                                <Form role="form" onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <label className="form-control-label">Organization Name*</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="name"
                                            placeholder="Enter your organization name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            invalid={!!errors.name}
                                        />
                                        <FormFeedback>{errors.name}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <label className="form-control-label">Organization Address*</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="address"
                                            placeholder="Enter your organization location"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            invalid={!!errors.address}
                                        />
                                        <FormFeedback>{errors.address}</FormFeedback>
                                    </FormGroup>



                                    <FormGroup>
                                        <label className="form-control-label">Organization Type*</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="type"
                                            placeholder="Enter your type of organization"
                                            type="text"
                                            value={formData.type}
                                            onChange={handleChange}
                                            invalid={!!errors.type}
                                        />
                                        <FormFeedback>{errors.taxNumber}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <label className="form-control-label">Tax Number*</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="taxNumber"
                                            placeholder="Enter your tax number"
                                            type="text"
                                            value={formData.taxNumber}
                                            onChange={handleChange}
                                            invalid={!!errors.taxNumber}
                                        />
                                        <FormFeedback>{errors.taxNumber}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <label className="form-control-label">Phone</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="phone"
                                            placeholder="Enter your phone number"
                                            type="text"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                    <div className="text-center">
                                        <Button
                                            className="my-4"
                                            color="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registering...' : 'Register Business'}
                                        </Button>


                                    </div>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusinessRegistrationPage;