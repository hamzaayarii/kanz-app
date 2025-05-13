import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, FormGroup, Label, Container, Alert, FormFeedback, Row, Col } from 'reactstrap';
import debounce from 'lodash/debounce';

// Validation regex patterns
const PATTERNS = {
    amount: /^\d+(\.\d{1,2})?$/,
    year: /^\d{4}$/,
};

// Messages d'erreur personnalisés
const ERROR_MESSAGES = {
    required: 'Ce champ est requis',
    invalidAmount: 'Nombre positif requis (max 2 décimales)',
    invalidYear: 'Année invalide (format YYYY)',
    pastLimit: 'Année antérieure à 2000 non permise',
    futureYear: 'Année future non permise',
};

// Helper to get role from token (copied from AnomalyDetection.js)
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

const TaxReportForm = () => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [year, setYear] = useState('');
    const [formErrors, setFormErrors] = useState({ income: '', expenses: '', year: '', selectedBusiness: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [calculatedTax, setCalculatedTax] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for business selection (copied from AnomalyDetection.js)
    const [owners, setOwners] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState(null);

    const API_BASE_URL = 'http://localhost:5000';
    const currentYear = new Date().getFullYear();

    // --- Start: Logic copied and adapted from AnomalyDetection.js ---
    useEffect(() => {
        setCurrentUserRole(getRoleFromToken());
        if (getRoleFromToken() === "accountant") {
            fetchBusinessOwners();
        } else { // Assuming non-accountant is business_owner for this form's context
            fetchUserBusinesses();
        }
    }, []);

    const fetchBusinessOwners = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/users/assigned-business-owners`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOwners(res.data || []);
        } catch (err) {
            setError("Failed to load business owners.");
        }
    };

    const fetchBusinessesForOwner = async (ownerId) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/business/getUserBusinessesByAccountant?ownerId=${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedBusinesses = res.data.businesses || [];
            setBusinesses(fetchedBusinesses);
            if (fetchedBusinesses.length > 0) {
                setSelectedBusiness(fetchedBusinesses[0]._id);
            } else {
                setSelectedBusiness("");
            }
        } catch (err) {
            setError("Failed to load businesses for selected owner.");
            setBusinesses([]);
            setSelectedBusiness("");
        }
    };

    const fetchUserBusinesses = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/business/user-businesses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedBusinesses = res.data.businesses || res.data || []; // Handle both potential response structures
            setBusinesses(fetchedBusinesses);
            if (fetchedBusinesses.length > 0) {
                setSelectedBusiness(fetchedBusinesses[0]._id);
            } else {
                 setSelectedBusiness("");
            }
        } catch (err) {
            setError("Failed to load your businesses.");
            setBusinesses([]);
            setSelectedBusiness("");
        }
    };

    const handleOwnerChange = (e) => {
        const ownerId = e.target.value;
        setSelectedOwner(ownerId);
        setBusinesses([]); // Clear previous businesses
        setSelectedBusiness(""); // Clear selected business
        if (ownerId) {
            fetchBusinessesForOwner(ownerId);
        }
    };
    // --- End: Logic copied and adapted from AnomalyDetection.js ---

    // Validation avancée
    const validateAmount = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return PATTERNS.amount.test(value) && Number(value) >= 0 ? '' : ERROR_MESSAGES.invalidAmount;
    }, []);

    const validateYear = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        if (!PATTERNS.year.test(value)) return ERROR_MESSAGES.invalidYear;
        const yearNum = Number(value);
        if (yearNum < 2000) return ERROR_MESSAGES.pastLimit;
        if (yearNum > currentYear) return ERROR_MESSAGES.futureYear;
        return '';
    }, [currentYear]);

    const debouncedValidate = useCallback(
        debounce((name, value) => {
            const errorMsg = name === 'year' ? validateYear(value) : validateAmount(value);
            setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
        }, 300),
        [validateAmount, validateYear]
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'income': setIncome(value); break;
            case 'expenses': setExpenses(value); break;
            case 'year': setYear(value); break;
            default: break;
        }
        debouncedValidate(name, value);
        setError('');
        setMessage('');
    };

    const validateFullForm = () => {
        const currentFormErrors = {
            income: validateAmount(income),
            expenses: validateAmount(expenses),
            year: validateYear(year)
        };
        setFormErrors(currentFormErrors);
        
        if (!selectedBusiness) {
            setError('Please select a business.');
            return false;
        }
        if (currentUserRole === 'accountant' && !selectedOwner) {
             setError('Accountants must select a business owner.');
             return false;
        }

        return Object.values(currentFormErrors).every(errorMsg => !errorMsg);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateFullForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentification requise');

            const payload = {
                businessId: selectedBusiness,
                income: Number(income),
                expenses: Number(expenses),
                year: Number(year)
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/taxReports/generate`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message || 'Tax report generated successfully!');
            setCalculatedTax(response.data.taxReport?.calculatedTax);
            setIncome('');
            setExpenses('');
            setYear('');
            setFormErrors({ income: '', expenses: '', year: '', selectedBusiness: '' });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Échec de la génération du rapport fiscal');
            setCalculatedTax(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 20px',
            fontFamily: "'Arial', sans-serif"
        }}>
            <Container style={{
                maxWidth: '800px',
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
                        Generate a Tax Report
                    </h2>
                    <p style={{ margin: '10px 0 0', fontSize: '18px' }}>Create your tax report easily</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {error && (
                        <Alert color="danger" style={{ borderRadius: '10px', marginBottom: '20px', fontWeight: '500', background: 'linear-gradient(to right, #ff6b6b, #ff8787)', color: 'white', border: 'none' }}>
                            {error}
                        </Alert>
                    )}
                    {message && (
                        <Alert color="success" style={{ borderRadius: '10px', marginBottom: '20px', fontWeight: '500', background: 'linear-gradient(to right, #2ecc71, #27ae60)', color: 'white', border: 'none' }}>
                            {message}
                            {calculatedTax !== null && (
                                <div>Taxe calculée (TND) : {calculatedTax.toFixed(2)}</div>
                            )}
                        </Alert>
                    )}

                    {/* Business Selection Dropdowns */}
                    {currentUserRole === "accountant" && (
                        <FormGroup>
                            <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="ownerSelect">Select Business Owner</Label>
                            <Input
                                type="select"
                                id="ownerSelect"
                                value={selectedOwner}
                                onChange={handleOwnerChange}
                                style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                            >
                                <option value="">-- Select Owner --</option>
                                {owners.map((owner) => (
                                    <option key={owner._id} value={owner._id}>
                                        {owner.fullName || owner.email}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                    )}

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }} for="businessSelect">Select Business</Label>
                        <Input
                            type="select"
                            id="businessSelect"
                            value={selectedBusiness}
                            onChange={(e) => setSelectedBusiness(e.target.value)}
                            disabled={currentUserRole === "accountant" && !selectedOwner && businesses.length === 0}
                            style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                        >
                            <option value="">-- Select Business --</option>
                            {businesses.map(business => (
                                <option key={business._id} value={business._id}>
                                    {business.name}
                                </option>
                            ))}
                        </Input>
                         {formErrors.selectedBusiness && <FormFeedback>{formErrors.selectedBusiness}</FormFeedback>}
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Income (TND)</Label>
                        <Input
                            type="number"
                            name="income"
                            value={income}
                            onChange={handleInputChange}
                            disabled={loading}
                            invalid={!!formErrors.income}
                            required
                            min="0"
                            step="0.01"
                            placeholder="Enter your income"
                            style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s ease' }}
                            onFocus={e => e.target.style.borderColor = '#4facfe'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                        <FormFeedback>{formErrors.income}</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Expenses (TND)</Label>
                        <Input
                            type="number"
                            name="expenses"
                            value={expenses}
                            onChange={handleInputChange}
                            disabled={loading}
                            invalid={!!formErrors.expenses}
                            required
                            min="0"
                            step="0.01"
                            placeholder="Enter your expenses"
                            style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s ease' }}
                            onFocus={e => e.target.style.borderColor = '#4facfe'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                        <FormFeedback>{formErrors.expenses}</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Year</Label>
                        <Input
                            type="number"
                            name="year"
                            value={year}
                            onChange={handleInputChange}
                            disabled={loading}
                            invalid={!!formErrors.year}
                            required
                            min="2000"
                            max={currentYear}
                            placeholder="Enter the year"
                            style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s ease' }}
                            onFocus={e => e.target.style.borderColor = '#4facfe'}
                            onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                        <FormFeedback>{formErrors.year}</FormFeedback>
                    </FormGroup>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || Object.values(formErrors).some(err => !!err) || !selectedBusiness}
                        style={{
                            background: 'linear-gradient(to right, #2ecc71, #27ae60)',
                            color: 'white',
                            padding: '15px 40px',
                            borderRadius: '25px',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)',
                            display: 'block',
                            margin: '20px auto 0'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {loading ? 'Génération...' : 'Generate Report'}
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default TaxReportForm;