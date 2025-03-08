import React, { useState } from 'react';
import axios from 'axios';
import { Form, FormGroup, Input, Button, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({ email: '' });
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? '' : 'Invalid email address';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error sending reset link');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg="5">
                    <Card>
                        <CardBody>
                            <div className="text-center mb-4">
                                <h2>Reset Password</h2>
                                <p>Enter your email to receive a password reset link.</p>
                            </div>
                            {message && <p className="text-center text-success">{message}</p>}
                            <Form role="form" onSubmit={handleSubmit}>
                                <FormGroup className="mb-3">
                                    <InputGroup className="input-group-alternative">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="ni ni-email-83" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setErrors({ email: validateEmail(e.target.value) });
                                            }}
                                            invalid={!!errors.email}
                                        />
                                        <FormFeedback>{errors.email}</FormFeedback>
                                    </InputGroup>
                                </FormGroup>

                                <div className="text-center">
                                    <Button
                                        className="my-4"
                                        color="primary"
                                        type="submit"
                                        disabled={!!errors.email || !email}
                                    >
                                        Send Reset Link
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <Link to="/auth/login">Back to Login</Link>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PasswordReset;