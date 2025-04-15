import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Alert,
    Form,
    Input,
    FormGroup,
    InputGroup
} from 'reactstrap';

const EmailVerification = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        // If there's a token in the URL, try to verify with it
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    const verifyEmail = async (verificationToken) => {
        try {
            setStatus('verifying');
            const response = await axios.get(`http://localhost:5000/api/users/verify/${verificationToken}`);
            if (response.data.success) {
                setStatus('success');
                setMessage('Email verified successfully! You can now log in.');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/auth/login');
                }, 3000);
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error verifying email. Please try again.');
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        if (!verificationCode.trim()) {
            setMessage('Please enter the verification code');
            return;
        }
        await verifyEmail(verificationCode);
    };

    const handleResendVerification = async () => {
        try {
            const email = localStorage.getItem('pendingVerificationEmail');
            if (!email) {
                setMessage('Please register again to receive a new verification email.');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/users/resend-verification', { email });
            if (response.data.success) {
                setMessage('New verification email sent! Please check your inbox.');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error sending verification email.');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg="6">
                    <Card>
                        <CardBody className="text-center">
                            <h2 className="mb-4">Email Verification</h2>
                            
                            {status === 'verifying' && (
                                <>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Verifying...</span>
                                    </div>
                                    <p className="mt-3">Verifying your email address...</p>
                                </>
                            )}

                            {status === 'success' && (
                                <Alert color="success">
                                    {message}
                                </Alert>
                            )}

                            {status === 'error' && (
                                <>
                                    <Alert color="danger">
                                        {message}
                                    </Alert>
                                    <Button
                                        color="primary"
                                        onClick={handleResendVerification}
                                        className="mt-3"
                                    >
                                        Resend Verification Email
                                    </Button>
                                </>
                            )}

                            {status === 'pending' && (
                                <>
                                    <p>Please enter the verification code sent to your email:</p>
                                    <Form onSubmit={handleCodeSubmit}>
                                        <FormGroup>
                                            <InputGroup>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    maxLength="6"
                                                    className="text-center"
                                                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                                />
                                            </InputGroup>
                                        </FormGroup>
                                        <Button color="primary" type="submit">
                                            Verify Code
                                        </Button>
                                    </Form>
                                    <div className="mt-3">
                                        <Button
                                            color="link"
                                            onClick={handleResendVerification}
                                        >
                                            Resend verification code
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EmailVerification; 