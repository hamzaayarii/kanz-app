import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, CardTitle, Input, Label, FormFeedback, FormGroup } from 'reactstrap';
import { FaMoneyCheckAlt, FaEdit, FaTrash, FaFileInvoice, FaSpinner } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import styles from '../../assets/css/PayrollManagement.module.css';

// Validation regex patterns
const PATTERNS = {
    period: /^\d{4}-(0[1-9]|1[0-2])$/,
    numeric: /^\d+(\.\d{1,2})?$/,
};

// Messages d'erreur personnalisés
const ERROR_MESSAGES = {
    required: 'Ce champ est requis',
    invalidPeriod: 'Format attendu : YYYY-MM (ex: 2025-04)',
    invalidEmployee: 'Veuillez sélectionner un employé valide',
    futurePeriod: 'La période ne peut pas être dans le futur',
    pastLimit: 'La période ne peut pas être antérieure à 2000',
};

const PayrollManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [cnssDeclaration, setCnssDeclaration] = useState(null);
    const [loading, setLoading] = useState({ fetch: false, submit: false });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ employeeId: '', period: '' });
    const [formErrors, setFormErrors] = useState({ employeeId: '', period: '' });
    const [editPayroll, setEditPayroll] = useState(null);
    const [cnssPeriod, setCnssPeriod] = useState('');
    const [cnssPeriodError, setCnssPeriodError] = useState('');

    const API_URL = 'http://localhost:5000/api';

    // Validation avancée pour la période
    const validatePeriod = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        if (!PATTERNS.period.test(value)) return ERROR_MESSAGES.invalidPeriod;

        const [year, month] = value.split('-').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (year < 2000) return ERROR_MESSAGES.pastLimit;
        if (year > currentYear || (year === currentYear && month > currentMonth)) {
            return ERROR_MESSAGES.futurePeriod;
        }
        return '';
    }, []);

    // Validation employé
    const validateEmployeeId = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        if (!employees.some(emp => emp._id === value)) {
            return ERROR_MESSAGES.invalidEmployee;
        }
        return '';
    }, [employees]);

    // Validation debounce
    const debouncedValidate = useCallback(
        debounce((name, value) => {
            const error = name === 'period' ? validatePeriod(value) : validateEmployeeId(value);
            setFormErrors(prev => ({ ...prev, [name]: error }));
        }, 300),
        [validatePeriod, validateEmployeeId]
    );

    useEffect(() => {
        fetchEmployees();
        fetchPayrolls();
    }, []);

    const fetchEmployees = async () => {
        setLoading(prev => ({ ...prev, fetch: true }));
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Authentication required');
            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.employees || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des employés');
        } finally {
            setLoading(prev => ({ ...prev, fetch: false }));
        }
    };

    const fetchPayrolls = async () => {
        setLoading(prev => ({ ...prev, fetch: true }));
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/payrolls`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayrolls(response.data.payrolls || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des paies');
        } finally {
            setLoading(prev => ({ ...prev, fetch: false }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        debouncedValidate(name, value);
    };

    const handleCnssPeriodChange = (e) => {
        const value = e.target.value;
        setCnssPeriod(value);
        setCnssPeriodError(validatePeriod(value));
    };

    const validateForm = () => {
        const errors = {
            employeeId: validateEmployeeId(formData.employeeId),
            period: validatePeriod(formData.period),
        };
        setFormErrors(errors);
        return Object.values(errors).every(error => !error);
    };

    const handleSubmit = async (isUpdate = false) => {
        if (!validateForm()) return;

        setLoading(prev => ({ ...prev, submit: true }));
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            const url = isUpdate
                ? `${API_URL}/payrolls/${editPayroll._id}`
                : `${API_URL}/payrolls/generate`;
            const method = isUpdate ? axios.put : axios.post;

            const response = await method(url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isUpdate) {
                setPayrolls(payrolls.map(p => p._id === editPayroll._id ? response.data.payroll : p));
                setEditPayroll(null);
            } else {
                setPayrolls([...payrolls, response.data.payroll]);
            }

            setSuccess(response.data.message);
            setFormData({ employeeId: '', period: '' });
            setFormErrors({ employeeId: '', period: '' });
        } catch (err) {
            setError(err.response?.data?.message || `Erreur lors de ${isUpdate ? 'la mise à jour' : 'la génération'} de la paie`);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleEditPayroll = (payroll) => {
        setEditPayroll(payroll);
        setFormData({
            employeeId: payroll.employeeId._id,
            period: new Date(payroll.period).toISOString().slice(0, 7)
        });
        setFormErrors({ employeeId: '', period: '' });
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette paie ?')) return;
        setLoading(prev => ({ ...prev, submit: true }));
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/payrolls/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayrolls(payrolls.filter(p => p._id !== id));
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression de la paie');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleGenerateCnssDeclaration = async () => {
        const periodError = validatePeriod(cnssPeriod);
        setCnssPeriodError(periodError);
        if (periodError) return;

        setLoading(prev => ({ ...prev, submit: true }));
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/payrolls/declare-cnss`,
                { period: cnssPeriod },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCnssDeclaration(response.data.declaration);
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la génération de la déclaration CNSS');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><FaMoneyCheckAlt /> Centre de Paie</h2>
            {error && <Alert color="danger" className={styles.alert}>{error}</Alert>}
            {success && <Alert color="success" className={styles.alert}>{success}</Alert>}
            {(loading.fetch || loading.submit) && (
                <div className={styles.spinner}>
                    <FaSpinner className="fa-spin" /> Chargement...
                </div>
            )}

            {/* Formulaire de paie */}
            <Card className={styles.card}>
                <CardTitle tag="h3" className={styles.cardTitle}>
                    {editPayroll ? 'Modifier la Paie' : 'Générer une Paie'}
                </CardTitle>
                <CardBody>
                    <FormGroup className={styles.form}>
                        <FormGroup className={styles.field}>
                            <Label>Employé</Label>
                            <Input
                                type="select"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit || employees.length === 0}
                                invalid={!!formErrors.employeeId}
                                required
                            >
                                <option value="">Sélectionnez un employé</option>
                                {employees.map(employee => (
                                    <option key={employee._id} value={employee._id}>
                                        {employee.firstName} {employee.lastName}
                                    </option>
                                ))}
                            </Input>
                            <FormFeedback>{formErrors.employeeId}</FormFeedback>
                        </FormGroup>

                        <FormGroup className={styles.field}>
                            <Label>Période (YYYY-MM)</Label>
                            <Input
                                type="month"
                                name="period"
                                value={formData.period}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.period}
                                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                                required
                            />
                            <FormFeedback>{formErrors.period}</FormFeedback>
                        </FormGroup>

                        <div className={styles.buttonGroup}>
                            <Button
                                color="primary"
                                onClick={() => handleSubmit(!!editPayroll)}
                                disabled={loading.submit || Object.values(formErrors).some(err => !!err)}
                            >
                                {loading.submit ? <FaSpinner className="fa-spin" /> : editPayroll ? 'Mettre à jour' : 'Générer'}
                            </Button>
                            {editPayroll && (
                                <Button
                                    color="secondary"
                                    onClick={() => {
                                        setEditPayroll(null);
                                        setFormData({ employeeId: '', period: '' });
                                        setFormErrors({ employeeId: '', period: '' });
                                    }}
                                    disabled={loading.submit}
                                    className={styles.cancelButton}
                                >
                                    Annuler
                                </Button>
                            )}
                        </div>
                    </FormGroup>
                </CardBody>
            </Card>

            {/* Déclaration CNSS */}
            <Card className={styles.card}>
                <CardTitle tag="h3" className={styles.cardTitle}>
                    <FaFileInvoice /> Générer une Déclaration CNSS
                </CardTitle>
                <CardBody>
                    <div className={styles.form}>
                        <FormGroup className={styles.field}>
                            <Label>Période (YYYY-MM)</Label>
                            <Input
                                type="month"
                                value={cnssPeriod}
                                onChange={handleCnssPeriodChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!cnssPeriodError}
                                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                                required
                            />
                            <FormFeedback>{cnssPeriodError}</FormFeedback>
                        </FormGroup>
                        <Button
                            color="info"
                            onClick={handleGenerateCnssDeclaration}
                            disabled={loading.submit || !!cnssPeriodError}
                        >
                            {loading.submit ? <FaSpinner className="fa-spin" /> : 'Générer la Déclaration CNSS'}
                        </Button>
                    </div>
                    {cnssDeclaration && (
                        <div className={styles.cnssDeclaration}>
                            <h4>Déclaration CNSS ({cnssDeclaration.period})</h4>
                            <p><strong>Total CNSS:</strong> {cnssDeclaration.totalCnss.toFixed(2)} TND</p>
                            <h5>Employés:</h5>
                            {cnssDeclaration.employees.map(emp => (
                                <div key={emp.employeeId} className={styles.cnssEmployee}>
                                    <p><strong>Nom:</strong> {emp.employeeName}</p>
                                    <p><strong>Salaire brut:</strong> {emp.grossSalary.toFixed(2)} TND</p>
                                    <p><strong>Contribution CNSS:</strong> {emp.cnssContribution.toFixed(2)} TND</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Liste des paies */}
            <div className={styles.payrollList}>
                <h3 className={styles.subtitle}>Liste des Paies</h3>
                {payrolls.length === 0 && !loading.fetch && !error && (
                    <Alert color="warning">Aucune paie trouvée.</Alert>
                )}
                {payrolls.map(payroll => (
                    <Card key={payroll._id} className={styles.payrollCard}>
                        <CardBody>
                            <div className={styles.payrollInfo}>
                                <p><strong>Employé:</strong> {payroll.employeeId ? `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}` : 'Inconnu'}</p>
                                <p><strong>Entreprise:</strong> {payroll.businessId?.name || 'Inconnu'}</p>
                                <p><strong>Période:</strong> {new Date(payroll.period).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                                <p><strong>Salaire brut:</strong> {payroll.grossSalary.toFixed(2)} TND</p>
                                <p><strong>Contribution CNSS:</strong> {payroll.cnssContribution.toFixed(2)} TND</p>
                                <p><strong>IRPP:</strong> {payroll.irpp.toFixed(2)} TND</p>
                                <p><strong>Salaire net:</strong> {payroll.netSalary.toFixed(2)} TND</p>
                            </div>
                            <div className={styles.payrollActions}>
                                <Button
                                    color="success"
                                    onClick={() => handleEditPayroll(payroll)}
                                    disabled={loading.submit}
                                    className={styles.editButton}
                                >
                                    <FaEdit /> Modifier
                                </Button>
                                <Button
                                    color="danger"
                                    onClick={() => handleDeletePayroll(payroll._id)}
                                    disabled={loading.submit}
                                    className={styles.deleteButton}
                                >
                                    <FaTrash /> Supprimer
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PayrollManagement;