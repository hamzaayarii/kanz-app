import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Table,
    Button,
    FormGroup,
    Label,
    Input,
    Alert,
    Spinner
} from 'reactstrap';

const API_URL = 'http://localhost:5000';

const getRoleFromToken = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch {
        return null;
    }
};

const AnomalyDetection = () => {
    const [owners, setOwners] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [anomalies, setAnomalies] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        setCurrentUserRole(getRoleFromToken());
        if (getRoleFromToken() === "accountant") {
            fetchBusinessOwners();
        } else {
            fetchUserBusinesses();
        }
    }, []);

    // Fetch business owners assigned to this accountant
    const fetchBusinessOwners = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_URL}/api/users/assigned-business-owners`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOwners(res.data || []);
        } catch (err) {
            setError("Failed to load business owners.");
        }
    };

    // Fetch businesses for selected owner (for accountant)
    const fetchBusinesses = async (ownerId) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_URL}/api/business/getUserBusinessesByAccountant?ownerId=${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusinesses(res.data.businesses || []);
            if (res.data.businesses.length > 0) {
                setSelectedBusiness(res.data.businesses[0]._id);
            } else {
                setSelectedBusiness("");
            }
        } catch (err) {
            setError("Failed to load businesses.");
        }
    };

    // Fetch businesses for business owner
    const fetchUserBusinesses = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_URL}/api/business/user-businesses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusinesses(res.data.businesses || []);
            if (res.data.businesses.length > 0) {
                setSelectedBusiness(res.data.businesses[0]._id);
            }
        } catch (err) {
            setError("Failed to load your businesses.");
        }
    };

    const handleOwnerChange = (e) => {
        const ownerId = e.target.value;
        setSelectedOwner(ownerId);
        setBusinesses([]);
        setSelectedBusiness("");
        if (ownerId) fetchBusinesses(ownerId);
    };

    const fetchAnomalies = async () => {
        if (!selectedBusiness || !startDate || !endDate) {
            setError('Please select a business and date range');
            return;
        }

        setLoading(true);
        setError('');
        setAnomalies(null);

        try {
            const token = localStorage.getItem('authToken');
            const url = selectedType === 'all' 
                ? `${API_URL}/api/anomalies/business/${selectedBusiness}`
                : `${API_URL}/api/anomalies/business/${selectedBusiness}/${selectedType}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: { startDate, endDate }
            });

            if (selectedType === 'all') {
                const totalAnomalies = response.data.totalAnomalies;
                if (totalAnomalies === 0) {
                    setError('No anomalies detected in the selected date range');
                } else {
                    setAnomalies(response.data);
                }
            } else {
                if (!response.data || response.data.length === 0) {
                    setError('No anomalies detected in the selected date range');
                } else {
                    setAnomalies(response.data);
                }
            }
        } catch (err) {
            console.error('Error fetching anomalies:', err);
            setError(err.response?.data?.message || 'Failed to load anomalies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderAnomalyTable = (anomalies, title) => {
        if (!anomalies || anomalies.length === 0) return null;

        return (
            <Card className="mb-4">
                <CardHeader>
                    <h3 className="mb-0">{title}</h3>
                </CardHeader>
                <CardBody>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Value</th>
                                <th>Z-Score</th>
                                <th>Mean</th>
                                <th>Std Dev</th>
                                {title.includes('Expense') && <th>Category</th>}
                                {title.includes('Invoice') && <th>Client</th>}
                                {title.includes('Tax') && (
                                    <>
                                        <th>Income</th>
                                        <th>Expenses</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {anomalies.map((anomaly, index) => (
                                <tr key={index}>
                                    <td>{new Date(anomaly.date).toLocaleDateString()}</td>
                                    <td>{anomaly.value.toFixed(2)} TND</td>
                                    <td>{anomaly.zScore.toFixed(2)}</td>
                                    <td>{anomaly.mean.toFixed(2)}</td>
                                    <td>{anomaly.stdDev.toFixed(2)}</td>
                                    {title.includes('Expense') && <td>{anomaly.category}</td>}
                                    {title.includes('Invoice') && <td>{anomaly.clientName}</td>}
                                    {title.includes('Tax') && (
                                        <>
                                            <td>{anomaly.income.toFixed(2)}</td>
                                            <td>{anomaly.expenses.toFixed(2)}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        );
    };

    return (
        <Container className="mt-5">
            <Card className="shadow">
                <CardHeader className="bg-transparent">
                    <h3 className="mb-0">Financial Anomaly Detection</h3>
                </CardHeader>
                <CardBody>
                    {error && <Alert color="danger">{error}</Alert>}

                    {currentUserRole === "accountant" && (
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Select Business Owner</Label>
                                    <Input
                                        type="select"
                                        value={selectedOwner}
                                        onChange={handleOwnerChange}
                                    >
                                        <option value="">-- Select Owner --</option>
                                        {owners.map((owner) => (
                                            <option key={owner._id} value={owner._id}>
                                                {owner.fullName || owner.email}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Select Business</Label>
                                <Input
                                    type="select"
                                    value={selectedBusiness}
                                    onChange={(e) => setSelectedBusiness(e.target.value)}
                                    disabled={currentUserRole === "accountant" && !selectedOwner}
                                >
                                    <option value="">Select a business</option>
                                    {businesses.map(business => (
                                        <option key={business._id} value={business._id}>
                                            {business.name}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <FormGroup>
                                <Label>Anomaly Type</Label>
                                <Input
                                    type="select"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="all">All Anomalies</option>
                                    <option value="revenue">Revenue</option>
                                    <option value="expense">Expense</option>
                                    <option value="invoice">Invoice</option>
                                    <option value="tax">Tax</option>
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={6} className="d-flex align-items-end">
                            <Button
                                color="primary"
                                onClick={fetchAnomalies}
                                disabled={loading || !selectedBusiness || !startDate || !endDate}
                            >
                                {loading ? <Spinner size="sm" /> : 'Detect Anomalies'}
                            </Button>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner />
                            <p className="mt-2">Analyzing financial data...</p>
                        </div>
                    ) : anomalies && (
                        <>
                            {selectedType === 'all' ? (
                                <>
                                    {renderAnomalyTable(anomalies.revenueAnomalies, 'Revenue Anomalies')}
                                    {renderAnomalyTable(anomalies.expenseAnomalies, 'Expense Anomalies')}
                                    {renderAnomalyTable(anomalies.invoiceAnomalies, 'Invoice Anomalies')}
                                    {renderAnomalyTable(anomalies.taxAnomalies, 'Tax Anomalies')}
                                    <Alert color="info">
                                        Total Anomalies Detected: {anomalies.totalAnomalies}
                                    </Alert>
                                </>
                            ) : (
                                renderAnomalyTable(
                                    anomalies,
                                    `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Anomalies`
                                )
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </Container>
    );
};

export default AnomalyDetection; 