import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from '../../assets/css/PayrollManagement.module.css';

const PayrollManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [cnssDeclaration, setCnssDeclaration] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        employeeId: '',
        period: ''
    });
    const [editPayroll, setEditPayroll] = useState(null);
    const [cnssPeriod, setCnssPeriod] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchEmployees();
        fetchPayrolls();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.employees || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchPayrolls = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/payrolls`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayrolls(response.data.payrolls || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching payrolls');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.employeeId || !formData.period) {
            setError('Employee and period are required');
            return false;
        }
        if (!/^\d{4}-\d{2}$/.test(formData.period)) {
            setError('Period must be in YYYY-MM format');
            return false;
        }
        return true;
    };

    const handleGeneratePayroll = async () => {
        if (!validateForm()) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/payrolls/generate`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPayrolls([...payrolls, response.data.payroll]);
            setSuccess(response.data.message);
            setFormData({ employeeId: '', period: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPayroll = (payroll) => {
        setEditPayroll(payroll);
        setFormData({
            employeeId: payroll.employeeId._id,
            period: new Date(payroll.period).toISOString().slice(0, 7) // YYYY-MM
        });
    };

    const handleUpdatePayroll = async () => {
        if (!validateForm()) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/payrolls/${editPayroll._id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPayrolls(payrolls.map(p => (p._id === editPayroll._id ? response.data.payroll : p)));
            setSuccess(response.data.message);
            setEditPayroll(null);
            setFormData({ employeeId: '', period: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll?')) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/payrolls/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPayrolls(payrolls.filter(p => p._id !== id));
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCnssDeclaration = async () => {
        if (!cnssPeriod || !/^\d{4}-\d{2}$/.test(cnssPeriod)) {
            setError('Period must be in YYYY-MM format');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

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
            setError(err.response?.data?.message || 'Error generating CNSS declaration');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCnssPeriodChange = (e) => {
        setCnssPeriod(e.target.value);
    };

    return (
        <div className={styles.container}>
            <h2>Payroll Management</h2>
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}
            {loading && <p>Loading...</p>}

            {/* Form for Generating/Editing Payroll */}
            <div className={styles.form}>
                <h3>{editPayroll ? 'Edit Payroll' : 'Generate Payroll'}</h3>
                <div className={styles.field}>
                    <label>Employee</label>
                    <select
                        name="employeeId"
                        onChange={handleInputChange}
                        value={formData.employeeId}
                        disabled={loading || employees.length === 0}
                        required
                    >
                        <option value="">Select an employee</option>
                        {employees.map(employee => (
                            <option key={employee._id} value={employee._id}>
                                {employee.firstName} {employee.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label>Period (YYYY-MM)</label>
                    <input
                        type="month"
                        name="period"
                        onChange={handleInputChange}
                        value={formData.period}
                        disabled={loading}
                        required
                    />
                </div>
                <button
                    onClick={editPayroll ? handleUpdatePayroll : handleGeneratePayroll}
                    disabled={loading || !formData.employeeId || !formData.period}
                >
                    {loading ? 'Processing...' : editPayroll ? 'Update Payroll' : 'Generate Payroll'}
                </button>
                {editPayroll && (
                    <button
                        onClick={() => setEditPayroll(null)}
                        disabled={loading}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Generate CNSS Declaration */}
            <div className={styles.form}>
                <h3>Generate CNSS Declaration</h3>
                <div className={styles.field}>
                    <label>Period (YYYY-MM)</label>
                    <input
                        type="month"
                        value={cnssPeriod}
                        onChange={handleCnssPeriodChange}
                        disabled={loading}
                        required
                    />
                </div>
                <button
                    onClick={handleGenerateCnssDeclaration}
                    disabled={loading || !cnssPeriod}
                >
                    {loading ? 'Generating...' : 'Generate CNSS Declaration'}
                </button>
            </div>

            {/* CNSS Declaration Display */}
            {cnssDeclaration && (
                <div className={styles.cnssDeclaration}>
                    <h3>CNSS Declaration ({cnssDeclaration.period})</h3>
                    <p><strong>Total CNSS:</strong> {cnssDeclaration.totalCnss.toFixed(2)} TND</p>
                    <h4>Employees:</h4>
                    {cnssDeclaration.employees.map(emp => (
                        <div key={emp.employeeId} className={styles.employee}>
                            <p><strong>Name:</strong> {emp.employeeName}</p>
                            <p><strong>Gross Salary:</strong> {emp.grossSalary.toFixed(2)} TND</p>
                            <p><strong>CNSS Contribution:</strong> {emp.cnssContribution.toFixed(2)} TND</p>
                        </div>
                    ))}
                </div>
            )}

            {/* List of Payrolls */}
            <div className={styles.payrolls}>
                <h3>List of Payrolls</h3>
                {payrolls.length === 0 && !loading && !error && (
                    <Alert color="warning">No payrolls found.</Alert>
                )}
                {payrolls.map(payroll => (
                    <div key={payroll._id} className={styles.payroll}>
                        <p><strong>Employee:</strong> {payroll.employeeId ? `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}` : 'Unknown'}</p>
                        <p><strong>Business:</strong> {payroll.businessId?.name || 'Unknown'}</p>
                        <p><strong>Period:</strong> {new Date(payroll.period).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                        <p><strong>Gross Salary:</strong> {payroll.grossSalary.toFixed(2)} TND</p>
                        <p><strong>CNSS Contribution:</strong> {payroll.cnssContribution.toFixed(2)} TND</p>
                        <p><strong>IRPP:</strong> {payroll.irpp.toFixed(2)} TND</p>
                        <p><strong>Net Salary:</strong> {payroll.netSalary.toFixed(2)} TND</p>
                        <button
                            onClick={() => handleEditPayroll(payroll)}
                            disabled={loading}
                            className={styles.editButton}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeletePayroll(payroll._id)}
                            disabled={loading}
                            className={styles.deleteButton}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PayrollManagement;