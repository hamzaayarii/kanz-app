import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from '../../assets/css/EmployeeManagement.module.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        salary: '',
        hireDate: '',
        businessId: ''
    });
    const [editEmployee, setEditEmployee] = useState(null);
    const [importData, setImportData] = useState('');
    const [absenceData, setAbsenceData] = useState({
        employeeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [showAbsenceModal, setShowAbsenceModal] = useState(false);

    // Base URL for API (consider moving to .env)
    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchBusinesses();
        fetchEmployees();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/business/buisnessowner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinesses(response.data.businesses || []);
        } catch (err) {
            setError('Error fetching businesses');
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.employees || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.position ||
            !formData.salary || !formData.hireDate || !formData.businessId) {
            setError('All fields are required');
            return false;
        }
        if (Number(formData.salary) < 0) {
            setError('Salary must be a positive number');
            return false;
        }
        return true;
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/employees`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEmployees([...employees, response.data.employee]);
            setSuccess(response.data.message);
            setFormData({
                firstName: '',
                lastName: '',
                position: '',
                salary: '',
                hireDate: '',
                businessId: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding employee');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEmployee = (employee) => {
        setEditEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            salary: employee.salary.toString(), // Convert to string for input
            hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
            businessId: employee.businessId._id || employee.businessId // Handle populated vs ID
        });
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/employees/${editEmployee._id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEmployees(employees.map(emp =>
                emp._id === editEmployee._id ? response.data.employee : emp
            ));
            setSuccess(response.data.message);
            setEditEmployee(null);
            setFormData({
                firstName: '',
                lastName: '',
                position: '',
                salary: '',
                hireDate: '',
                businessId: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating employee');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEmployees(employees.filter(emp => emp._id !== id));
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting employee');
        } finally {
            setLoading(false);
        }
    };

    const handleImportEmployees = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const employeesToImport = JSON.parse(importData);
            if (!Array.isArray(employeesToImport) || employeesToImport.length === 0) {
                throw new Error('Import data must be a non-empty array');
            }
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/employees/import`,
                { employees: employeesToImport },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEmployees([...employees, ...response.data.employees]);
            setSuccess(response.data.message);
            setImportData('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error importing employees');
        } finally {
            setLoading(false);
        }
    };

    const handleAbsenceInputChange = (e) => {
        setAbsenceData({ ...absenceData, [e.target.name]: e.target.value });
    };

    const validateAbsence = () => {
        if (!absenceData.startDate || !absenceData.endDate || !absenceData.reason) {
            setError('All absence fields are required');
            return false;
        }
        const start = new Date(absenceData.startDate);
        const end = new Date(absenceData.endDate);
        if (start > end) {
            setError('Start date must be before end date');
            return false;
        }
        return true;
    };

    const handleAddAbsence = async () => {
        if (!validateAbsence()) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/employees/${absenceData.employeeId}/absences`,
                absenceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEmployees(employees.map(emp =>
                emp._id === absenceData.employeeId ? response.data.employee : emp
            ));
            setSuccess(response.data.message);
            setShowAbsenceModal(false);
            setAbsenceData({ employeeId: '', startDate: '', endDate: '', reason: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding absence');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Employee Management</h2>
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}
            {loading && <p>Loading...</p>}

            {/* Form for Adding/Editing Employee */}
            <div className={styles.form}>
                <h3>{editEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
                <form onSubmit={editEmployee ? handleUpdateEmployee : handleAddEmployee}>
                    <div className={styles.field}>
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Position</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Salary (TND)</label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Hire Date</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={formData.hireDate}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Business</label>
                        <select
                            name="businessId"
                            value={formData.businessId}
                            onChange={handleInputChange}
                            disabled={loading || businesses.length === 0}
                            required
                        >
                            <option value="">Select a business</option>
                            {businesses.map(business => (
                                <option key={business._id} value={business._id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : editEmployee ? 'Update Employee' : 'Add Employee'}
                    </button>
                    {editEmployee && (
                        <button
                            type="button"
                            onClick={() => setEditEmployee(null)}
                            disabled={loading}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            {/* Import Employees */}
            <div className={styles.import}>
                <h3>Import Employees</h3>
                <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='Paste JSON array of employees here'
                    rows="4"
                    disabled={loading}
                />
                <button onClick={handleImportEmployees} disabled={loading || !importData}>
                    {loading ? 'Importing...' : 'Import Employees'}
                </button>
            </div>

            {/* List of Employees */}
            <div className={styles.employees}>
                <h3>List of Employees</h3>
                {employees.length === 0 && !loading && !error && (
                    <Alert color="warning">No employees found.</Alert>
                )}
                {employees.map(employee => (
                    <div key={employee._id} className={styles.employee}>
                        <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
                        <p><strong>Position:</strong> {employee.position}</p>
                        <p><strong>Salary:</strong> {employee.salary} TND</p>
                        <p><strong>Hire Date:</strong> {new Date(employee.hireDate).toLocaleDateString()}</p>
                        <p><strong>Business:</strong> {employee.businessId?.name || 'Unknown'}</p>
                        {employee.absences && employee.absences.length > 0 && (
                            <div>
                                <strong>Absences:</strong>
                                <ul>
                                    {employee.absences.map((absence, index) => (
                                        <li key={index}>
                                            {new Date(absence.startDate).toLocaleDateString()} -
                                            {new Date(absence.endDate).toLocaleDateString()}: {absence.reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button
                            onClick={() => handleEditEmployee(employee)}
                            disabled={loading}
                            className={styles.editButton}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteEmployee(employee._id)}
                            disabled={loading}
                            className={styles.deleteButton}
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => {
                                setAbsenceData({ ...absenceData, employeeId: employee._id });
                                setShowAbsenceModal(true);
                            }}
                            disabled={loading}
                            className={styles.absenceButton}
                        >
                            Add Absence
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Adding Absence */}
            <Modal isOpen={showAbsenceModal} toggle={() => setShowAbsenceModal(false)}>
                <ModalHeader toggle={() => setShowAbsenceModal(false)}>Add Absence</ModalHeader>
                <ModalBody>
                    <div className={styles.field}>
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={absenceData.startDate}
                            onChange={handleAbsenceInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={absenceData.endDate}
                            onChange={handleAbsenceInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Reason</label>
                        <input
                            type="text"
                            name="reason"
                            value={absenceData.reason}
                            onChange={handleAbsenceInputChange}
                            disabled={loading}
                            required
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleAddAbsence} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Absence'}
                    </Button>
                    <Button color="secondary" onClick={() => setShowAbsenceModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;