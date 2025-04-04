import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

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

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');

            const response = await axios.get(`${API_URL}/taxReports/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReports(response.data.reports || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load tax reports');
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tax report?')) return;

        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');

            const response = await axios.delete(`${API_URL}/taxReports/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReports(reports.filter(report => report._id !== id));
            setSuccess(response.data.message);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete tax report');
        }
    };

    const updateReport = async (id) => {
        if (!income || !expenses || !year) {
            setError('All fields are required');
            return;
        }

        if (Number(income) < 0 || Number(expenses) < 0) {
            setError('Income and expenses must be positive numbers');
            return;
        }

        const currentYear = new Date().getFullYear();
        if (Number(year) < 2000 || Number(year) > currentYear) {
            setError(`Year must be between 2000 and ${currentYear}`);
            return;
        }

        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');

            const updatedData = {
                income: Number(income),
                expenses: Number(expenses),
                year: Number(year)
            };

            const response = await axios.put(`${API_URL}/taxReports/update/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Mise à jour immédiate de la liste avec les nouvelles données
            setReports(reports.map(report => (report._id === id ? response.data.taxReport : report)));
            setSuccess(response.data.message);
            setTimeout(() => setSuccess(''), 3000);
            toggleModal();
            // Rafraîchir la liste pour garantir la synchronisation avec le backend
            fetchReports();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update tax report');
        }
    };

    const toggleModal = () => {
        setModal(!modal);
        if (!modal) {
            setError('');
            setSuccess('');
        } else {
            setIncome('');
            setExpenses('');
            setYear('');
            setSelectedReport(null);
        }
    };

    const openEditModal = (report) => {
        setSelectedReport(report);
        setIncome(report.income.toString());
        setExpenses(report.expenses.toString());
        setYear(report.year.toString());
        toggleModal();
    };

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
                    <p style={{ margin: '10px 0 0', fontSize: '18px' }}>View and manage your tax reports</p>
                </div>

                <div style={{ padding: '40px' }}>
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

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                            <Spinner style={{ width: '3rem', height: '3rem', borderWidth: '0.4em', color: '#4facfe' }} />
                            <p style={{ marginTop: '15px', fontSize: '1.2rem', color: '#4facfe', fontWeight: '500' }}>
                                Loading reports...
                            </p>
                        </div>
                    ) : (
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
                            {reports.length > 0 ? (
                                reports.map(report => (
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
                                                color="warning"
                                                onClick={() => openEditModal(report)}
                                                style={{
                                                    background: 'linear-gradient(to right, #f1c40f, #f39c12)',
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    padding: '8px 16px',
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
                                                color="danger"
                                                onClick={() => deleteReport(report._id)}
                                                style={{
                                                    background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                                                    border: 'none',
                                                    borderRadius: '25px',
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}>
                                        No tax reports found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Container>

            {/* Modal for editing tax report */}
            <Modal isOpen={modal} toggle={toggleModal} style={{ fontFamily: "'Arial', sans-serif" }}>
                <ModalHeader toggle={toggleModal} style={{
                    background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                    color: 'white',
                    borderRadius: '10px 10px 0 0'
                }}>
                    Update Tax Report
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
                    <Form>
                        <FormGroup>
                            <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Year</Label>
                            <Input
                                type="number"
                                name="year"
                                value={year}
                                onChange={e => setYear(e.target.value)}
                                required
                                min="2000"
                                max={new Date().getFullYear()}
                                style={{
                                    padding: '12px 16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={e => e.target.style.borderColor = '#4facfe'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Income (TND)</Label>
                            <Input
                                type="number"
                                name="income"
                                value={income}
                                onChange={e => setIncome(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                style={{
                                    padding: '12px 16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={e => e.target.style.borderColor = '#4facfe'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Expenses (TND)</Label>
                            <Input
                                type="number"
                                name="expenses"
                                value={expenses}
                                onChange={e => setExpenses(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                style={{
                                    padding: '12px 16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={e => e.target.style.borderColor = '#4facfe'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter style={{ padding: '15px' }}>
                    <Button
                        color="primary"
                        onClick={() => updateReport(selectedReport?._id)}
                        style={{
                            background: 'linear-gradient(to right, #2ecc71, #27ae60)',
                            border: 'none',
                            borderRadius: '25px',
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
                        color="secondary"
                        onClick={toggleModal}
                        style={{
                            background: 'linear-gradient(to right, #bdc3c7, #95a5a6)',
                            border: 'none',
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
        </div>
    );
};

export default TaxReportsList;