import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'reactstrap';
import styles from '../../assets/css/FinancialStatements.module.css';

const FinancialStatements = () => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [formData, setFormData] = useState({
        businessId: '',
        periodStart: '',
        periodEnd: ''
    });

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:5000/api/business/buisnessowner', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBusinesses(response.data.businesses || []);
            } catch (err) {
                setError('Erreur lors de la récupération des sociétés');
            }
        };

        fetchBusinesses();
    }, []);

    const handleGenerateBalanceSheet = async () => {
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/financial-statements/generate-balance-sheet',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStatements([...statements, response.data.financialStatement]);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la génération du bilan');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.container}>
            <h2>États Financiers</h2>
            {error && <Alert color="danger">{error}</Alert>}

            <div className={styles.form}>
                <div className={styles.field}>
                    <label>Société</label>
                    <select name="businessId" onChange={handleInputChange} value={formData.businessId}>
                        <option value="">Sélectionner une société</option>
                        {businesses.map(business => (
                            <option key={business._id} value={business._id}>{business.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label>Début de période</label>
                    <input type="date" name="periodStart" onChange={handleInputChange} value={formData.periodStart} />
                </div>
                <div className={styles.field}>
                    <label>Fin de période</label>
                    <input type="date" name="periodEnd" onChange={handleInputChange} value={formData.periodEnd} />
                </div>
                <button onClick={handleGenerateBalanceSheet} disabled={loading}>
                    {loading ? 'Génération...' : 'Générer un bilan'}
                </button>
            </div>

            <div className={styles.statements}>
                {statements.map(statement => (
                    <div key={statement._id} className={styles.statement}>
                        <h3>Bilan ({new Date(statement.periodStart).toLocaleDateString()} - {new Date(statement.periodEnd).toLocaleDateString()})</h3>
                        <p><strong>Actifs :</strong></p>
                        <p>Créances clients : {statement.data.assets.receivables} TND</p>
                        <p>Trésorerie : {statement.data.assets.cash} TND</p>
                        <p><strong>Passifs :</strong></p>
                        <p>Dettes fournisseurs : {statement.data.liabilities.payables} TND</p>
                        <p><strong>Capitaux propres :</strong> {statement.data.equity} TND</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinancialStatements;