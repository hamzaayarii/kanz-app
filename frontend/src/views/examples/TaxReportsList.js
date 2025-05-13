import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

// Helper to get role from token (copied from other components)
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

const TaxReportsList = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [year, setYear] = useState('');

    // State for business selection
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [owners, setOwners] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const API_BASE_URL = 'http://localhost:5000'; // Ensure this is consistent

    useEffect(() => {
        const role = getRoleFromToken();
        setCurrentUserRole(role);
        if (role === "accountant") {
            fetchBusinessOwners();
        } else if (role) { // Assuming non-accountant with a role is business_owner
            fetchUserBusinesses();
        }
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            fetchReports(selectedBusiness);
        } else if (currentUserRole && currentUserRole !== 'accountant' && businesses.length > 0 && !selectedBusiness) {
            // If business owner and businesses are loaded but none selected, select the first one automatically
            // This might be too aggressive, consider if user should explicitly select
            // setSelectedBusiness(businesses[0]._id);
            // For now, let's not auto-select and require manual selection, or fetch all if no business selected.
            // fetchReports(); // Or clear reports: setReports([]);
             setReports([]); // Clear reports if no business is selected for BO after initial load
        } else if (currentUserRole === 'accountant' && !selectedBusiness) {
            setReports([]); // Clear reports if accountant has not selected a business
        }
        // Initial fetch for BOs without pre-selected business is handled by fetchUserBusinesses potentially setting selectedBusiness
    }, [selectedBusiness, currentUserRole]); 

    const fetchBusinessOwners = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/users/assigned-business-owners`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOwners(res.data || []);
        } catch (err) {
            setError("Failed to load business owners.");
        } finally {
            setLoading(false); // Stop loading after owners are fetched
        }
    };

    const fetchBusinessesForOwner = async (ownerId) => {
        if (!ownerId) {
            setBusinesses([]);
            setSelectedBusiness("");
            setReports([]);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/business/getUserBusinessesByAccountant?ownerId=${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedBusinesses = res.data.businesses || [];
            setBusinesses(fetchedBusinesses);
            if (fetchedBusinesses.length > 0) {
                // Don't auto-select, let user pick
                // setSelectedBusiness(fetchedBusinesses[0]._id);
            } else {
                setSelectedBusiness("");
                setReports([]);
            }
        } catch (err) {
            setError("Failed to load businesses for selected owner.");
            setBusinesses([]);
            setSelectedBusiness("");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBusinesses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/business/user-businesses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedBusinesses = res.data.businesses || res.data || [];
            setBusinesses(fetchedBusinesses);
            if (fetchedBusinesses.length === 1) { // If only one business, auto-select it
                setSelectedBusiness(fetchedBusinesses[0]._id);
            } else if (fetchedBusinesses.length > 1) {
                // Multiple businesses, prompt selection
                 setSelectedBusiness("");
                 setReports([]);
            } else {
                setSelectedBusiness("");
                setError("No businesses found for your account.");
                setReports([]);
            }
        } catch (err) {
            setError("Failed to load your businesses.");
            setBusinesses([]);
            setSelectedBusiness("");
            setReports([]);
        } finally {
            setLoading(false);
            setInitialLoadDone(true);
        }
    };

    const handleOwnerChange = (e) => {
        const ownerId = e.target.value;
        setSelectedOwner(ownerId);
        setBusinesses([]); 
        setSelectedBusiness(""); 
        setReports([]);
        if (ownerId) {
            fetchBusinessesForOwner(ownerId);
        } else {
             setLoading(false); // Stop loading if owner is deselected
        }
    };
    
    const handleBusinessChange = (e) => {
        const businessId = e.target.value;
        setSelectedBusiness(businessId);
        if (!businessId) {
            setReports([]); // Clear reports if no business selected
        }
    };

    const fetchReports = async (businessIdToFetch = null) => {
        let targetBusinessId = businessIdToFetch || selectedBusiness;

        if (!targetBusinessId && currentUserRole !== 'accountant') {
            // For business owners, if no specific businessId is passed or selected, try to use one if available
            // This part might be redundant if selectedBusiness is managed well by dropdowns
        }
        
        if (!targetBusinessId) { // If still no business ID, don't fetch.
            setReports([]);
            setLoading(false);
            // Optionally, set an error or info message if business selection is strictly required
            // setError("Please select a business to view reports."); 
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');

            // Assuming the API can take businessId as a query param
            const response = await axios.get(`${API_BASE_URL}/api/taxReports/reports?businessId=${targetBusinessId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.reports || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load tax reports for the selected business');
            setReports([]); // Clear reports on error
        } finally {
            setLoading(false);
            setInitialLoadDone(true); 
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tax report?')) return;
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');
            const response = await axios.delete(`${API_BASE_URL}/api/taxReports/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(response.data.message);
            fetchReports(selectedBusiness); // Refetch for current business
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete tax report');
        }
    };

    const updateReport = async (reportId) => {
        if (!income || !expenses || !year) {
            setError('All fields are required for update.'); // Error in modal
            return;
        }
        // Add other validations as they were
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');
            const updatedData = { income: Number(income), expenses: Number(expenses), year: Number(year) };
            const response = await axios.put(`${API_BASE_URL}/api/taxReports/update/${reportId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(response.data.message);
            toggleModal();
            fetchReports(selectedBusiness); // Refetch for current business
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update tax report'); // Show error in modal or main page
        }
    };

    const toggleModal = () => {
        setModal(!modal);
        if (modal) { // If closing modal, clear form states
            setSelectedReport(null);
            setIncome('');
            setExpenses('');
            setYear('');
            setError(''); // Clear modal-specific errors
        }
    };

    const openEditModal = (report) => {
        setSelectedReport(report);
        setIncome(report.income.toString());
        setExpenses(report.expenses.toString());
        setYear(report.year.toString());
        setError(''); // Clear previous errors
        setModal(true);
    };

    const renderDropdowns = () => (
        <Row className="mb-3">
            {currentUserRole === "accountant" && (
                <Col md="6">
                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="ownerSelect">Select Business Owner</Label>
                        <Input type="select" name="ownerSelect" id="ownerSelect" value={selectedOwner} onChange={handleOwnerChange} 
                               style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}>
                            <option value="">-- Select Owner --</option>
                            {owners.map(owner => <option key={owner._id} value={owner._id}>{owner.fullName || owner.email}</option>)}
                        </Input>
                    </FormGroup>
                </Col>
            )}
            <Col md={currentUserRole === "accountant" ? "6" : "12"}>
                <FormGroup>
                    <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="businessSelect">Select Business</Label>
                    <Input 
                        type="select" 
                        name="businessSelect" 
                        id="businessSelect" 
                        value={selectedBusiness} 
                        onChange={handleBusinessChange} 
                        style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                        disabled={(currentUserRole === "accountant" && !selectedOwner && businesses.length === 0) || (currentUserRole !== "accountant" && businesses.length === 0 && !initialLoadDone)}
                    >
                        <option value="">-- Select Business --</option>
                        {businesses.map(business => <option key={business._id} value={business._id}>{business.name}</option>)}
                    </Input>
                </FormGroup>
            </Col>
        </Row>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 20px',
            fontFamily: "'Arial', sans-serif"
        }}>
            <Container style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                    padding: '30px',
                    color: 'white',
                    borderRadius: '20px 20px 0 0'
                }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                        Your Tax Reports
                    </h2>
                    <p style={{ margin: '10px 0 0', fontSize: '18px' }}>
                        {selectedBusiness ? `Showing reports for ${businesses.find(b => b._id === selectedBusiness)?.name || 'selected business'}` : 'View and manage your tax reports. Please select a business.'}
                    </p>
                </div>

                <div style={{ padding: '40px' }}>
                    {renderDropdowns()}
                    {error && (
                        <Alert color="danger" style={{
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: '500',
                            background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                            color: 'white',
                            border: 'none'
                        }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert color="success" style={{
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: '500',
                            background: 'linear-gradient(to right, #2ecc71, #27ae60)',
                            color: 'white',
                            border: 'none'
                        }}>
                            {success}
                        </Alert>
                    )}

                    {loading && !reports.length ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                            <Spinner style={{ width: '3rem', height: '3rem', borderWidth: '0.4em', color: '#4facfe' }} />
                            <p style={{ marginTop: '15px', fontSize: '1.2rem', color: '#4facfe', fontWeight: '500' }}>
                                Loading ...
                            </p>
                        </div>
                    ) : !selectedBusiness && initialLoadDone && currentUserRole !== 'accountant' && businesses.length > 1 ? (
                        <Alert color="info" style={{ borderRadius: '10px', background: 'linear-gradient(to right, #5bc0de, #31b0d5)', color: 'white', border: 'none' }}>Please select a business to view its tax reports.</Alert>
                    ) : !selectedBusiness && initialLoadDone && currentUserRole === 'accountant' && selectedOwner ? (
                        <Alert color="info" style={{ borderRadius: '10px', background: 'linear-gradient(to right, #5bc0de, #31b0d5)', color: 'white', border: 'none' }}>Please select a business for the chosen owner.</Alert>
                    ) : selectedBusiness && !loading && reports.length === 0 && initialLoadDone ? (
                        <Alert color="info" style={{ borderRadius: '10px', background: 'linear-gradient(to right, #5bc0de, #31b0d5)', color: 'white', border: 'none' }}>No tax reports found for the selected business.</Alert>
                    ) : reports.length > 0 ? (
                        <Table bordered hover style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                        }}>
                            <thead>
                            <tr style={{
                                background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                <th style={{ padding: '15px' }}>Year</th>
                                <th style={{ padding: '15px' }}>Income (TND)</th>
                                <th style={{ padding: '15px' }}>Expenses (TND)</th>
                                <th style={{ padding: '15px' }}>Calculated Tax (TND)</th>
                                <th style={{ padding: '15px' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report._id} style={{
                                        transition: 'transform 0.2s ease, background-color 0.3s ease'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <td style={{ padding: '15px' }}>{report.year}</td>
                                        <td style={{ padding: '15px' }}>{report.income.toFixed(2)}</td>
                                        <td style={{ padding: '15px' }}>{report.expenses.toFixed(2)}</td>
                                        <td style={{ padding: '15px' }}>{report.calculatedTax.toFixed(2)}</td>
                                        <td style={{ padding: '15px' }}>
                                            <Button
                                                onClick={() => openEditModal(report)}
                                                style={{
                                                    background: 'linear-gradient(to right, #f1c40f, #f39c12)',
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    padding: '8px 16px',
                                                    color: 'white',
                                                    fontWeight: '500',
                                                    marginRight: '10px',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                onClick={() => deleteReport(report._id)}
                                                style={{
                                                    background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                         !initialLoadDone && loading && <div style={{ textAlign: 'center', padding: '50px 0' }}><Spinner style={{ width: '3rem', height: '3rem', borderWidth: '0.4em', color: '#4facfe' }} /><p style={{ marginTop: '15px', fontSize: '1.2rem', color: '#4facfe', fontWeight: '500' }}>Loading initial data...</p></div>
                    ) }
                </div>
            </Container>

            {selectedReport && (
                <Modal isOpen={modal} toggle={toggleModal} centered style={{ fontFamily: "'Arial', sans-serif" }}>
                    <ModalHeader toggle={toggleModal} style={{
                        background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                        color: 'white',
                        borderRadius: '10px 10px 0 0'
                    }}>
                        Update Tax Report for {selectedReport.year}
                    </ModalHeader>
                    <ModalBody style={{ padding: '20px' }}>
                        {error && (
                            <Alert color="danger" style={{
                                borderRadius: '10px',
                                marginBottom: '20px',
                                fontWeight: '500',
                                background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                                color: 'white',
                                border: 'none'
                            }}>
                                {error} {/* Modal specific error display */}
                            </Alert>
                        )}
                        <Form>
                            <FormGroup>
                                <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="reportIncome">Income (TND)</Label>
                                <Input type="number" name="income" id="reportIncome" value={income} onChange={(e) => setIncome(e.target.value)} 
                                       style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}/>
                            </FormGroup>
                            <FormGroup>
                                <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="reportExpenses">Expenses (TND)</Label>
                                <Input type="number" name="expenses" id="reportExpenses" value={expenses} onChange={(e) => setExpenses(e.target.value)}
                                       style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }} />
                            </FormGroup>
                            <FormGroup>
                                <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="reportYear">Year</Label>
                                <Input type="number" name="year" id="reportYear" value={year} onChange={(e) => setYear(e.target.value)} 
                                       style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}/>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter style={{ padding: '15px' }}>
                        <Button 
                            onClick={() => updateReport(selectedReport._id)} 
                            style={{
                                background: 'linear-gradient(to right, #2ecc71, #27ae60)',
                                border: 'none',
                                borderRadius: '25px',
                                color: 'white',
                                padding: '10px 20px',
                                fontWeight: '500',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                            Save Changes
                        </Button>
                        <Button 
                            onClick={toggleModal} 
                            style={{
                                background: 'linear-gradient(to right, #bdc3c7, #95a5a6)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '25px',
                                padding: '10px 20px',
                                fontWeight: '500',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </div>
    );
};

export default TaxReportsList;