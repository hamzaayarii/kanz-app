import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, FormGroup, Label, Container, Alert } from 'reactstrap';

const TaxReportForm = () => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [year, setYear] = useState('');
    const [taxRate, setTaxRate] = useState(0.15); // Default tax rate
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!income || !expenses || !year) {
            setError('All fields are required.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/taxReports/generate',
                { income, expenses, year, taxRate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Tax report generated successfully');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to generate tax report. Please try again.');
        }
    };

    return (
        <Container>
            <h2>Generate Tax Report</h2>
            {error && <Alert color="danger">{error}</Alert>}
            {message && <Alert color="success">{message}</Alert>}

            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="income">Income</Label>
                    <Input
                        type="number"
                        id="income"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="expenses">Expenses</Label>
                    <Input
                        type="number"
                        id="expenses"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="year">Year</Label>
                    <Input
                        type="number"
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                    />
                </FormGroup>
                <Button type="submit" color="primary">Generate Report</Button>
            </form>
        </Container>
    );
};

export default TaxReportForm;
