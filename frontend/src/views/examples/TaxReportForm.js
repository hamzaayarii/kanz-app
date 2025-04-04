import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Input, FormGroup, Label, Container, Alert, FormFeedback } from 'reactstrap';
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

const TaxReportForm = () => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [year, setYear] = useState('');
    const [formErrors, setFormErrors] = useState({ income: '', expenses: '', year: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [calculatedTax, setCalculatedTax] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api';
    const currentYear = new Date().getFullYear();

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
            const error = name === 'year' ? validateYear(value) : validateAmount(value);
            setFormErrors(prev => ({ ...prev, [name]: error }));
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

    const validateForm = () => {
        const errors = {
            income: validateAmount(income),
            expenses: validateAmount(expenses),
            year: validateYear(year)
        };
        setFormErrors(errors);
        return Object.values(errors).every(error => !error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentification requise');

            const response = await axios.post(
                `${API_URL}/taxReports/generate`,
                { income: Number(income), expenses: Number(expenses), year: Number(year) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message);
            setCalculatedTax(response.data.taxReport.calculatedTax);
            setIncome('');
            setExpenses('');
            setYear('');
            setFormErrors({ income: '', expenses: '', year: '' });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Échec de la génération du rapport fiscal');
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
                        Générer un Rapport Fiscal
                    </h2>
                    <p style={{ margin: '10px 0 0', fontSize: '18px' }}>Créez votre rapport fiscal facilement</p>
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
                    {message && (
                        <Alert color="success" style={{
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: '500',
                            background: 'linear-gradient(to right, #2ecc71, #27ae60)',
                            color: 'white',
                            border: 'none'
                        }}>
                            {message}
                            {calculatedTax !== null && (
                                <div>Taxe calculée (TND) : {calculatedTax.toFixed(2)}</div>
                            )}
                        </Alert>
                    )}

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Revenus (TND)</Label>
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
                            placeholder="Entrez vos revenus"
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
                        <FormFeedback>{formErrors.income}</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Dépenses (TND)</Label>
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
                            placeholder="Entrez vos dépenses"
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
                        <FormFeedback>{formErrors.expenses}</FormFeedback>
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Année</Label>
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
                            placeholder="Entrez l'année"
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
                        <FormFeedback>{formErrors.year}</FormFeedback>
                    </FormGroup>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || Object.values(formErrors).some(err => !!err)}
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
                            margin: '0 auto'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {loading ? 'Génération...' : 'Générer le Rapport'}
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default TaxReportForm;