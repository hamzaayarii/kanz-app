import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Table,
    Alert
} from 'reactstrap';
import axios from 'axios';
import Header from "components/Headers/Header.js";
import HoverSpeakText from '../../components/TTS/HoverSpeakText'; // Adjust path as needed
import TTSButton from '../../components/TTS/TTSButton'; // Adjust path as needed
import { useTTS } from '../../components/TTS/TTSContext'; // Adjust path as needed

const DailyRevenue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { isTTSEnabled, speak, stop } = useTTS();

    const [entry, setEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        revenues: {
            cash: { sales: 0, returns: 0, netCash: 0 },
            card: { sales: 0, returns: 0, netCard: 0 },
            other: []
        },
        expenses: {
            petty: 0,
            other: []
        },
        notes: '',
        autoJournalEntry: true
    });

    const [otherRevenue, setOtherRevenue] = useState({ type: '', amount: 0 });
    const [otherExpense, setOtherExpense] = useState({ description: '', amount: 0 });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [isLoading, setIsLoading] = useState(false);

    // Speak notification when it changes
    useEffect(() => {
        if (isTTSEnabled && notification.show) {
            speak(notification.message);
        }
    }, [notification, isTTSEnabled, speak]);

    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Configure axios with auth header
    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Add auth token to every request
    api.interceptors.request.use((config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Add response interceptor to handle auth errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('authToken');
                navigate('/auth/login');
            }
            return Promise.reject(error);
        }
    );

    // Fetch entry data if in edit mode
    useEffect(() => {
        const fetchEntry = async () => {
            if (isEditMode) {
                try {
                    setIsLoading(true);
                    const token = getAuthToken();
                    if (!token) {
                        navigate('/auth/login');
                        return;
                    }
                    const response = await api.get(`/daily-revenue/${id}`);
                    const entryData = response.data.data;
                    setEntry(entryData);
                } catch (error) {
                    if (error.response?.status === 401) {
                        navigate('/auth/login');
                    } else {
                        setNotification({
                            show: true,
                            message: error.response?.data?.message || 'Error fetching entry',
                            type: 'danger'
                        });
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchEntry();
    }, [id, isEditMode, navigate]);

    const handleRevenueChange = (type, field, value) => {
        setEntry(prev => ({
            ...prev,
            revenues: {
                ...prev.revenues,
                [type]: {
                    ...prev.revenues[type],
                    [field]: parseFloat(value) || 0
                }
            }
        }));
    };

    const addOtherRevenue = () => {
        if (!otherRevenue.type || !otherRevenue.amount) return;
        setEntry(prev => ({
            ...prev,
            revenues: {
                ...prev.revenues,
                other: [...prev.revenues.other, { ...otherRevenue }]
            }
        }));
        setOtherRevenue({ type: '', amount: 0 });
    };

    const addOtherExpense = () => {
        if (!otherExpense.description || !otherExpense.amount) return;
        setEntry(prev => ({
            ...prev,
            expenses: {
                ...prev.expenses,
                other: [...prev.expenses.other, { ...otherExpense }]
            }
        }));
        setOtherExpense({ description: '', amount: 0 });
    };

    const removeOtherRevenue = (index) => {
        setEntry(prev => ({
            ...prev,
            revenues: {
                ...prev.revenues,
                other: prev.revenues.other.filter((_, i) => i !== index)
            }
        }));
    };

    const removeOtherExpense = (index) => {
        setEntry(prev => ({
            ...prev,
            expenses: {
                ...prev.expenses,
                other: prev.expenses.other.filter((_, i) => i !== index)
            }
        }));
    };

    const validateEntry = (entry) => {
        if (entry.revenues.cash.sales < 0 || entry.revenues.cash.returns < 0 || entry.revenues.card.sales < 0 || entry.revenues.card.returns < 0) {
            return 'Sales and returns cannot be negative.';
        }
        if (entry.expenses.petty < 0) {
            return 'Petty cash expenses cannot be negative.';
        }
        if (
            entry.revenues.cash.sales === 0 &&
            entry.revenues.card.sales === 0 &&
            entry.revenues.other.length === 0 &&
            entry.expenses.petty === 0 &&
            entry.expenses.other.length === 0
        ) {
            return 'Please enter at least one revenue or expense.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateEntry(entry);
        if (validationError) {
            setNotification({ show: true, message: validationError, type: 'danger' });
            return;
        }
        try {
            setIsLoading(true);
            let response;
            
            if (isEditMode) {
                response = await api.put(`/daily-revenue/${id}`, entry);
                console.log("Edit response:", response.data);
                setNotification({
                    show: true,
                    message: 'Daily revenue entry updated successfully',
                    type: 'success'
                });
            } else {
                response = await api.post('/daily-revenue', entry);
                console.log("Create response:", response.data);
                setNotification({
                    show: true,
                    message: 'Daily revenue entry saved successfully',
                    type: 'success'
                });
                // Reset form only for new entries
                setEntry({
                    date: new Date().toISOString().split('T')[0],
                    revenues: {
                        cash: { sales: 0, returns: 0, netCash: 0 },
                        card: { sales: 0, returns: 0, netCard: 0 },
                        other: []
                    },
                    expenses: {
                        petty: 0,
                        other: []
                    },
                    notes: '',
                    autoJournalEntry: true
                });
            }
            
            // Check if an anomaly was detected
            console.log("Checking for anomaly in response:", response.data);
            if (response.data.anomalyDetected) {
                console.log("Anomaly detected!", response.data.anomalyDetails);
                const anomaly = response.data.anomalyDetails;
                // Display warning notification with anomaly information
                setTimeout(() => {
                    const message = anomaly.isExtreme 
                        ? `⚠️ EXTREME VALUE DETECTED: This revenue amount (${anomaly.value.toFixed(2)} TND) is more than 5x your historical average of ${anomaly.mean.toFixed(2)} TND! Please verify this is correct.`
                        : `⚠️ ANOMALY DETECTED: This revenue amount (${anomaly.value.toFixed(2)} TND) is unusual compared to your historical data. Average is ${anomaly.mean.toFixed(2)} TND with standard deviation of ${anomaly.stdDev.toFixed(2)} TND. Please verify if this is correct.`;
                    
                    setNotification({
                        show: true,
                        message: message,
                        type: anomaly.isExtreme ? 'danger' : 'warning'
                    });
                }, 1500); // Show after the success message
            } else {
                console.log("No anomaly detected in response");
            }

            // Navigate back to list after successful update
            if (isEditMode && !response.data.anomalyDetected) {
                setTimeout(() => {
                    navigate('/admin/daily-revenue-list');
                }, 1500);
            }
        } catch (error) {
            console.error("Error submitting daily revenue:", error);
            setNotification({
                show: true,
                message: error.response?.data?.message || 'Error saving daily revenue',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <Col xs="8">
                                        <h3 className="mb-0">
                                            <HoverSpeakText>
                                                {isEditMode ? 'Edit Daily Money Flow' : 'New Daily Money Flow'}
                                            </HoverSpeakText>
                                        </h3>
                                        {isTTSEnabled && (
                                           <TTSButton 
    elementId="daily-revenue-form" 
    className="mt-2 custom-tts-button" 
    label="Read entire form"
/>
                                        )}
                                    </Col>
                                    <Col className="text-right" xs="4">
                                        <HoverSpeakText textToSpeak="Back to list">
                                            <Button
                                                color="secondary"
                                                onClick={() => navigate('/admin/daily-revenue-list')}
                                                size="sm"
                                            >
                                                Back to List
                                            </Button>
                                        </HoverSpeakText>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody id="daily-revenue-form">
                                {notification.show && (
                                    <Alert 
                                        color={notification.type}
                                        toggle={() => {
                                            stop();
                                            setNotification({ ...notification, show: false });
                                        }}
                                    >
                                        <HoverSpeakText>
                                            {notification.message}
                                        </HoverSpeakText>
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <HoverSpeakText textToSpeak="Date">
                                                    <Label>Date</Label>
                                                </HoverSpeakText>
                                                <Input
                                                    type="date"
                                                    value={entry.date}
                                                    onChange={(e) => setEntry(prev => ({ ...prev, date: e.target.value }))}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <h4 className="mb-3">
                                        <HoverSpeakText>
                                            Revenue
                                        </HoverSpeakText>
                                    </h4>
                                    <Row>
                                        <Col md="6">
                                            <Card className="p-3">
                                                <h5>
                                                    <HoverSpeakText>
                                                        Cash
                                                    </HoverSpeakText>
                                                </h5>
                                                <FormGroup>
                                                    <HoverSpeakText textToSpeak="Cash sales">
                                                        <Label>Sales</Label>
                                                    </HoverSpeakText>
                                                    <Input
                                                        type="number"
                                                        value={entry.revenues.cash.sales}
                                                        onChange={(e) => handleRevenueChange('cash', 'sales', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <HoverSpeakText textToSpeak="Cash returns">
                                                        <Label>Returns</Label>
                                                    </HoverSpeakText>
                                                    <Input
                                                        type="number"
                                                        value={entry.revenues.cash.returns}
                                                        onChange={(e) => handleRevenueChange('cash', 'returns', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </FormGroup>
                                            </Card>
                                        </Col>
                                        <Col md="6">
                                            <Card className="p-3">
                                                <h5>
                                                    <HoverSpeakText>
                                                        Card
                                                    </HoverSpeakText>
                                                </h5>
                                                <FormGroup>
                                                    <HoverSpeakText textToSpeak="Card sales">
                                                        <Label>Sales</Label>
                                                    </HoverSpeakText>
                                                    <Input
                                                        type="number"
                                                        value={entry.revenues.card.sales}
                                                        onChange={(e) => handleRevenueChange('card', 'sales', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <HoverSpeakText textToSpeak="Card returns">
                                                        <Label>Returns</Label>
                                                    </HoverSpeakText>
                                                    <Input
                                                        type="number"
                                                        value={entry.revenues.card.returns}
                                                        onChange={(e) => handleRevenueChange('card', 'returns', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </FormGroup>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <h5 className="mt-4">
                                        <HoverSpeakText>
                                            Other Revenue
                                        </HoverSpeakText>
                                        <TTSButton 
                                            text="Other Revenue section. Add additional revenue types and amounts here."
                                            className="ml-2"
                                            size="sm"
                                        />
                                    </h5>
                                    <Row className="mb-3">
                                        <Col md="5">
                                            <HoverSpeakText textToSpeak="Other revenue type">
                                                <Input
                                                    type="text"
                                                    value={otherRevenue.type}
                                                    onChange={(e) => setOtherRevenue(prev => ({ ...prev, type: e.target.value }))}
                                                    placeholder="Type"
                                                />
                                            </HoverSpeakText>
                                        </Col>
                                        <Col md="5">
                                            <HoverSpeakText textToSpeak="Other revenue amount">
                                                <Input
                                                    type="number"
                                                    value={otherRevenue.amount}
                                                    onChange={(e) => setOtherRevenue(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                    placeholder="Amount"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </HoverSpeakText>
                                        </Col>
                                        <Col md="2">
                                            <HoverSpeakText textToSpeak="Add other revenue">
                                                <Button color="primary" onClick={addOtherRevenue} block>
                                                    Add
                                                </Button>
                                            </HoverSpeakText>
                                        </Col>
                                    </Row>

                                    {entry.revenues.other.length > 0 && (
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th><HoverSpeakText>Type</HoverSpeakText></th>
                                                    <th><HoverSpeakText>Amount</HoverSpeakText></th>
                                                    <th><HoverSpeakText>Action</HoverSpeakText></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry.revenues.other.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><HoverSpeakText>{item.type}</HoverSpeakText></td>
                                                        <td><HoverSpeakText>{item.amount} TND</HoverSpeakText></td>
                                                        <td>
                                                            <HoverSpeakText textToSpeak={`Remove ${item.type}`}>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => removeOtherRevenue(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </HoverSpeakText>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    <h4 className="mt-4 mb-3">
                                        <HoverSpeakText>
                                            Expenses
                                        </HoverSpeakText>
                                    </h4>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <HoverSpeakText textToSpeak="Petty cash expenses">
                                                    <Label>Petty Cash Expenses</Label>
                                                </HoverSpeakText>
                                                <Input
                                                    type="number"
                                                    value={entry.expenses.petty}
                                                    onChange={(e) => setEntry(prev => ({
                                                        ...prev,
                                                        expenses: {
                                                            ...prev.expenses,
                                                            petty: parseFloat(e.target.value) || 0
                                                        }
                                                    }))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <h5 className="mt-4">
                                        <HoverSpeakText>
                                            Other Expenses
                                        </HoverSpeakText>
                                        <TTSButton 
                                            text="Other Expenses section. Add additional expense descriptions and amounts here."
                                            className="ml-2"
                                            size="sm"
                                        />
                                    </h5>
                                    <Row className="mb-3">
                                        <Col md="5">
                                            <HoverSpeakText textToSpeak="Other expense description">
                                                <Input
                                                    type="text"
                                                    value={otherExpense.description}
                                                    onChange={(e) => setOtherExpense(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Description"
                                                />
                                            </HoverSpeakText>
                                        </Col>
                                        <Col md="5">
                                            <HoverSpeakText textToSpeak="Other expense amount">
                                                <Input
                                                    type="number"
                                                    value={otherExpense.amount}
                                                    onChange={(e) => setOtherExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                    placeholder="Amount"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </HoverSpeakText>
                                        </Col>
                                        <Col md="2">
                                            <HoverSpeakText textToSpeak="Add other expense">
                                                <Button color="primary" onClick={addOtherExpense} block>
                                                    Add
                                                </Button>
                                            </HoverSpeakText>
                                        </Col>
                                    </Row>

                                    {entry.expenses.other.length > 0 && (
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th><HoverSpeakText>Description</HoverSpeakText></th>
                                                    <th><HoverSpeakText>Amount</HoverSpeakText></th>
                                                    <th><HoverSpeakText>Action</HoverSpeakText></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry.expenses.other.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><HoverSpeakText>{item.description}</HoverSpeakText></td>
                                                        <td><HoverSpeakText>{item.amount} TND</HoverSpeakText></td>
                                                        <td>
                                                            <HoverSpeakText textToSpeak={`Remove ${item.description}`}>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => removeOtherExpense(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </HoverSpeakText>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    <FormGroup className="mt-4">
                                        <HoverSpeakText textToSpeak="Notes">
                                            <Label>Notes</Label>
                                        </HoverSpeakText>
                                        <Input
                                            type="textarea"
                                            value={entry.notes}
                                            onChange={(e) => setEntry(prev => ({ ...prev, notes: e.target.value }))}
                                            rows="3"
                                        />
                                    </FormGroup>

                                    <FormGroup check className="mb-3">
                                        <HoverSpeakText textToSpeak="Automatically create journal entry">
                                            <Label check>
                                                <Input
                                                    type="checkbox"
                                                    checked={entry.autoJournalEntry}
                                                    onChange={(e) => setEntry(prev => ({ ...prev, autoJournalEntry: e.target.checked }))}
                                                />{' '}
                                                Automatically create journal entry
                                            </Label>
                                        </HoverSpeakText>
                                    </FormGroup>

                                    <Row className="mt-4">
                                        <Col>
                                            <HoverSpeakText textToSpeak="Cancel">
                                                <Button 
                                                    color="secondary" 
                                                    onClick={() => navigate('/admin/daily-revenue-list')}
                                                    className="mr-2"
                                                >
                                                    Cancel
                                                </Button>
                                            </HoverSpeakText>
                                            <HoverSpeakText textToSpeak={isEditMode ? 'Update' : 'Save'}>
                                                <Button 
                                                    color="primary" 
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
                                                </Button>
                                            </HoverSpeakText>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default DailyRevenue;