import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    Table,
    Button,
    Badge,
    UncontrolledTooltip,
    FormGroup,
    Label,
    Input,
    Alert
} from 'reactstrap';
import axios from 'axios';
import Header from "components/Headers/Header.js";

const DailyRevenueList = ({ isAccountantView = false }) => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [anomalies, setAnomalies] = useState({});
    const [owners, setOwners] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [isAccountant, setIsAccountant] = useState(false);

    // Detect user role from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsAccountant(user.role === 'accountant');
        }
    }, []);

    // Fetch business owners for accountants
    useEffect(() => {
        if (!isAccountantView) return;
        
        const fetchOwners = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get('http://localhost:5000/api/users/assigned-business-owners', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOwners(res.data || []);
            } catch (err) {
                setError('Failed to load business owners.');
            }
        };
        
        fetchOwners();
    }, [isAccountantView]);

    // Fetch businesses for selected owner (for accountant)
    useEffect(() => {
        if (!isAccountantView || !selectedOwner) return;
        
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const url = `http://localhost:5000/api/business/getUserBusinessesByAccountant?ownerId=${selectedOwner}`;
                const response = await axios.get(url, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                const businesses = Array.isArray(response.data) ? response.data : (response.data.businesses || []);
                setBusinesses(businesses);
                
                if (businesses.length > 0) {
                    setSelectedBusiness(businesses[0]._id);
                } else {
                    setSelectedBusiness('');
                    setEntries([]);
                }
            } catch (err) {
                setError('Failed to load businesses.');
                setBusinesses([]);
            }
        };
        
        fetchBusinesses();
    }, [selectedOwner, isAccountantView]);

    // Fetch entries when business is selected or for regular view
    useEffect(() => {
        if (isAccountantView) {
            if (selectedBusiness) {
                fetchEntriesForBusiness(selectedBusiness);
                checkAnomaliesForBusiness(selectedBusiness);
            } else {
                setEntries([]);
                setIsLoading(false);
            }
        } else {
            fetchEntries();
            checkAnomalies();
        }
    }, [selectedBusiness, isAccountantView]);

    const fetchEntriesForBusiness = async (businessId) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/daily-revenue/business/${businessId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setEntries(response.data.data || []);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch daily revenue entries');
            setIsLoading(false);
            console.error('Error fetching daily revenue:', err);
        }
    };

    const checkAnomaliesForBusiness = async (businessId) => {
        try {
            const token = localStorage.getItem('authToken');
            
            // Get last 90 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);
            
            // Call anomaly detection API
            const anomalyResponse = await axios.get(
                `http://localhost:5000/api/anomalies/business/${businessId}/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Create map of anomalies by date for easy lookup
            const anomalyMap = {};
            anomalyResponse.data.forEach(anomaly => {
                const date = new Date(anomaly.date).toISOString().split('T')[0];
                anomalyMap[date] = anomaly;
            });
            
            setAnomalies(anomalyMap);
        } catch (err) {
            console.error('Error fetching anomalies:', err);
        }
    };

    const fetchEntries = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/daily-revenue', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setEntries(response.data.data || []);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch daily revenue entries');
            setIsLoading(false);
            console.error('Error fetching daily revenue:', err);
        }
    };

    // Fetch anomalies to indicate unusual entries
    const checkAnomalies = async () => {
        try {
            const token = localStorage.getItem('authToken');
            // Get user info to get business ID
            const userResponse = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (userResponse.data.business) {
                const businessId = userResponse.data.business;
                // Get last 90 days
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 90);
                
                // Call anomaly detection API
                const anomalyResponse = await axios.get(
                    `http://localhost:5000/api/anomalies/business/${businessId}/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Create map of anomalies by date for easy lookup
                const anomalyMap = {};
                anomalyResponse.data.forEach(anomaly => {
                    const date = new Date(anomaly.date).toISOString().split('T')[0];
                    anomalyMap[date] = anomaly;
                });
                
                setAnomalies(anomalyMap);
            }
        } catch (err) {
            console.error('Error fetching anomalies:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`http://localhost:5000/api/daily-revenue/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.status === 200) {
                    if (isAccountantView && selectedBusiness) {
                        await fetchEntriesForBusiness(selectedBusiness);
                    } else {
                        await fetchEntries();
                    }
                } else {
                    setError('Failed to delete entry');
                }
            } catch (err) {
                console.error('Error deleting entry:', err);
                setError(err.response?.data?.message || 'Failed to delete entry');
            }
        }
    };

    const handleUpdate = (id) => {
        navigate(`/admin/daily-revenue/edit/${id}`);
    };

    const calculateTotalRevenue = (entry) => {
        const cashNet = entry.revenues.cash.sales - entry.revenues.cash.returns;
        const cardNet = entry.revenues.card.sales - entry.revenues.card.returns;
        const otherRevenue = entry.revenues.other.reduce((sum, item) => sum + item.amount, 0);
        return cashNet + cardNet + otherRevenue;
    };

    const calculateTotalExpenses = (entry) => {
        const pettyExpenses = entry.expenses.petty || 0;
        const otherExpenses = entry.expenses.other.reduce((sum, item) => sum + item.amount, 0);
        return pettyExpenses + otherExpenses;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'TND'
        }).format(amount);
    };

    // Check if the entry is flagged as an anomaly
    const isAnomaly = (entry) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return anomalies[entryDate] !== undefined;
    };

    if (isLoading && !isAccountantView) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert color="danger" toggle={() => setError('')}>
                                {error}
                            </Alert>
                        </Col>
                    </Row>
                )}
                
                {isAccountantView && (
                    <Row className="mb-3">
                        <Col lg="6">
                            <Card className="shadow">
                                <CardBody>
                                    <FormGroup>
                                        <Label for="ownerId">Select Business Owner</Label>
                                        <Input
                                            type="select"
                                            id="ownerId"
                                            value={selectedOwner}
                                            onChange={e => setSelectedOwner(e.target.value)}
                                        >
                                            <option value="">-- Select Owner --</option>
                                            {owners.map(owner => (
                                                <option key={owner._id} value={owner._id}>
                                                    {owner.fullName || owner.email}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                    
                                    {selectedOwner && (
                                        <FormGroup>
                                            <Label for="businessId">Select Business</Label>
                                            <Input
                                                type="select"
                                                id="businessId"
                                                value={selectedBusiness}
                                                onChange={e => setSelectedBusiness(e.target.value)}
                                            >
                                                <option value="">-- Select Business --</option>
                                                {businesses.map(business => (
                                                    <option key={business._id} value={business._id}>
                                                        {business.name}
                                                    </option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}
                
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <Col xs="8">
                                        <h3 className="mb-0">Daily Money Flow History</h3>
                                    </Col>
                                    {!isAccountantView && (
                                        <Col className="text-right" xs="4">
                                            <Button
                                                color="primary"
                                                onClick={() => navigate('/admin/daily-revenue')}
                                                size="sm"
                                            >
                                                Add New Entry
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {(isAccountantView && !selectedBusiness) ? (
                                    <div className="text-center py-4">
                                        <p>Please select a business owner and business to view daily money flow entries.</p>
                                    </div>
                                ) : (
                                    <Table className="align-items-center table-flush" responsive>
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Cash Sales</th>
                                                <th>Card Sales</th>
                                                <th>Other Revenue</th>
                                                <th>Total Revenue</th>
                                                <th>Total Expenses</th>
                                                <th>Net Amount</th>
                                                {!isAccountantView && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAccountantView ? 7 : 8} className="text-center">
                                                        No daily money flow entries found
                                                    </td>
                                                </tr>
                                            ) : (
                                                entries.map((entry) => {
                                                    const totalRevenue = calculateTotalRevenue(entry);
                                                    const totalExpenses = calculateTotalExpenses(entry);
                                                    const netAmount = totalRevenue - totalExpenses;
                                                    const entryIsAnomaly = isAnomaly(entry);
                                                    const anomalyId = `anomaly-${entry._id}`;

                                                    return (
                                                        <tr key={entry._id}>
                                                            <td>
                                                                {formatDate(entry.date)}
                                                                {entryIsAnomaly && (
                                                                    <>
                                                                        <Badge color="warning" className="ml-2" id={anomalyId}>
                                                                            <i className="fas fa-exclamation-triangle"></i>
                                                                        </Badge>
                                                                        <UncontrolledTooltip
                                                                            target={anomalyId}
                                                                            placement="top"
                                                                        >
                                                                            Unusual revenue amount detected. This may need verification.
                                                                        </UncontrolledTooltip>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(entry.revenues.cash.sales - entry.revenues.cash.returns)}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(entry.revenues.card.sales - entry.revenues.card.returns)}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(entry.revenues.other.reduce((sum, item) => sum + item.amount, 0))}
                                                            </td>
                                                            <td className={`text-${entryIsAnomaly ? 'warning' : 'success'}`}>
                                                                {formatCurrency(totalRevenue)}
                                                            </td>
                                                            <td className="text-danger">
                                                                {formatCurrency(totalExpenses)}
                                                            </td>
                                                            <td>
                                                                <Badge color={netAmount >= 0 ? "success" : "danger"}>
                                                                    {formatCurrency(netAmount)}
                                                                </Badge>
                                                            </td>
                                                            {!isAccountantView && (
                                                                <td>
                                                                    <Button
                                                                        color="info"
                                                                        size="sm"
                                                                        className="mr-2"
                                                                        onClick={() => handleUpdate(entry._id)}
                                                                    >
                                                                        <i className="fas fa-edit mr-1"></i>
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        color="danger"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(entry._id)}
                                                                    >
                                                                        <i className="fas fa-trash mr-1"></i>
                                                                        Delete
                                                                    </Button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default DailyRevenueList;
