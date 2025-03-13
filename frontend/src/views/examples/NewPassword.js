import React, { useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, Input, Button, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, Container, Row, Col, Card, CardBody } from 'reactstrap';

const NewPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');

    const validatePassword = (password) => {
        return password.length >= 6 ? '' : 'Password must be at least 6 characters long';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordError = validatePassword(password);
        const confirmPasswordError = password !== confirmPassword ? 'Passwords do not match' : '';

        if (passwordError || confirmPasswordError) {
            setErrors({ password: passwordError, confirmPassword: confirmPasswordError });
            return;
        }
        const newPassword = password;
        try {
            const response = await axios.post('http://localhost:5000/api/users/reset-password', { token, newPassword });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error setting new password');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg="5">
                    <Card>
                        <CardBody>
                            <div className="text-center mb-4">
                                <h2>Set New Password</h2>
                                <p>Enter your new password below.</p>
                            </div>
                            {message && <p className="text-center text-success">{message}</p>}
                            <Form role="form" onSubmit={handleSubmit}>
                                <FormGroup className="mb-3">
                                    <InputGroup className="input-group-alternative">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="ni ni-lock-circle-open" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="New Password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setErrors({ ...errors, password: validatePassword(e.target.value) });
                                            }}
                                            invalid={!!errors.password}
                                        />
                                        <FormFeedback>{errors.password}</FormFeedback>
                                    </InputGroup>
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <InputGroup className="input-group-alternative">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="ni ni-lock-circle-open" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Confirm Password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setErrors({ ...errors, confirmPassword: e.target.value !== password ? 'Passwords do not match' : '' });
                                            }}
                                            invalid={!!errors.confirmPassword}
                                        />
                                        <FormFeedback>{errors.confirmPassword}</FormFeedback>
                                    </InputGroup>
                                </FormGroup>

                                <div className="text-center">
                                    <Button
                                        className="my-4"
                                        color="primary"
                                        type="submit"
                                        disabled={!!errors.password || !!errors.confirmPassword || !password || !confirmPassword}
                                    >
                                        Set Password
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

export default NewPassword;