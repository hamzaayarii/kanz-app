// // src/components/BusinessRegistration.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const BusinessRegistration = () => {
//     const [formData, setFormData] = useState({
//         name: '',
//         type: '',
//         taxNumber: '',
//         address: '',
//         phone: ''
//     });
//     const [errors, setErrors] = useState({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const validate = () => {
//         const newErrors = {};
//         if (!formData.name) newErrors.name = 'Business name is required';
//         if (!formData.type) newErrors.type = 'Business type is required';
//         if (!formData.taxNumber) newErrors.taxNumber = 'Tax number is required';
//         if (!formData.address) newErrors.address = 'Address is required';
//         return newErrors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Validate form
//         const newErrors = validate();
//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             // Get token from localStorage
//             const token = localStorage.getItem('token');

//             // Send request to register business
//             const response = await axios.post(
//                 'http://localhost:5000/api/business',
//                 formData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     },
//                     withCredentials: true
//                 }
//             );

//             if (response.data.status) {
//                 // Redirect to dashboard after successful registration
//                 navigate('/dashboard');
//             }
//         } catch (error) {
//             console.error('Error registering business:', error);
//             setErrors({ submit: error.response?.data?.errorMessage || 'Failed to register business' });
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="business-registration-container">
//             <div className="registration-form-wrapper">
//                 <h2>Welcome to Your Accounting App</h2>
//                 <p>Please provide your business details to get started</p>

//                 {errors.submit && <div className="error-message">{errors.submit}</div>}

//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="name">Organization Name*</label>
//                         <input
//                             type="text"
//                             id="name"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleChange}
//                             className={errors.name ? 'error' : ''}
//                         />
//                         {errors.name && <span className="error-text">{errors.name}</span>}
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="type">Business Type*</label>
//                         <select
//                             id="type"
//                             name="type"
//                             value={formData.type}
//                             onChange={handleChange}
//                             className={errors.type ? 'error' : ''}
//                         >
//                             <option value="">Select Business Type</option>
//                             <option value="sole_proprietorship">Sole Proprietorship</option>
//                             <option value="partnership">Partnership</option>
//                             <option value="corporation">Corporation</option>
//                             <option value="llc">Limited Liability Company (LLC)</option>
//                             <option value="other">Other</option>
//                         </select>
//                         {errors.type && <span className="error-text">{errors.type}</span>}
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="taxNumber">Tax Number*</label>
//                         <input
//                             type="text"
//                             id="taxNumber"
//                             name="taxNumber"
//                             value={formData.taxNumber}
//                             onChange={handleChange}
//                             className={errors.taxNumber ? 'error' : ''}
//                         />
//                         {errors.taxNumber && <span className="error-text">{errors.taxNumber}</span>}
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="address">Business Address*</label>
//                         <input
//                             type="text"
//                             id="address"
//                             name="address"
//                             value={formData.address}
//                             onChange={handleChange}
//                             className={errors.address ? 'error' : ''}
//                         />
//                         {errors.address && <span className="error-text">{errors.address}</span>}
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="phone">Business Phone</label>
//                         <input
//                             type="tel"
//                             id="phone"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleChange}
//                         />
//                     </div>

//                     <button type="submit" className="submit-btn" disabled={isSubmitting}>
//                         {isSubmitting ? 'Registering...' : "Let's Get Started!"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default BusinessRegistration;

// src/views/examples/BusinessRegistration.js
// import React from "react";
// import { Container } from "reactstrap";
// import BusinessForm from "components/BusinessForm.jsx";
// import Header from "components/Headers/Header.js";

// const BusinessRegistration = () => {
//     return (
//         <>
//             <Header />
//             <Container className="mt--7" fluid>
//                 <BusinessForm />
//             </Container>
//         </>
//     );
// };

// export default BusinessRegistration;


import React, { useState } from 'react';
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
} from 'reactstrap';
import Header from 'components/Headers/Header.js'; // Adjust import path as needed

const BusinessRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organizationName: '',
        organizationLocation: '',
        // Add more fields as needed
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                'http://localhost:5000/api/business',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                // Redirect to dashboard after successful registration
                navigate('/admin/index');
            } else {
                setError(response.data.message || 'Failed to register business');
            }
        } catch (error) {
            console.error('Business registration error:', error);
            setError(
                error.response?.data?.message || 'An error occurred during registration'
            );
        }
    };

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row className="justify-content-center">
                    <Col className="order-xl-1" xl="8">
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
                                    {error && (
                                        <div className="text-center mb-3">
                                            <small className="text-danger">{error}</small>
                                        </div>
                                    )}
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
                                        {/* Add more form fields as needed */}
                                    </div>
                                    <div className="text-center mt-4">
                                        <Button color="primary" type="submit">
                                            Register Business
                                        </Button>
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

export default BusinessRegistration;