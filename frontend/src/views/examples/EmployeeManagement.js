import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, CardTitle, Input, Label, FormFeedback, FormGroup, Table, Badge } from 'reactstrap';
import { FaUserPlus, FaEdit, FaTrash, FaCalendarAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import styles from '../../assets/css/EmployeeManagement.module.css';

const PATTERNS = {
    name: /^[a-zA-Z\s-]{2,50}$/,
    position: /^[a-zA-Z\s-]{2,100}$/,
    salary: /^\d+(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    reason: /^.{2,200}$/,
};

const ERROR_MESSAGES = {
    required: 'This field is required',
    invalidName: '2-50 characters, letters only',
    invalidPosition: '2-100 characters, letters only',
    invalidSalary: 'Positive number required',
    invalidDate: 'Format YYYY-MM-DD required',
    pastLimit: 'Dates before 2000 not allowed',
    futureDate: 'Future dates not allowed',
    invalidReason: '2-200 characters required',
    invalidDateRange: 'End date must be after start date',
};

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState({ fetch: false, submit: false });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: ''
    });
    const [formErrors, setFormErrors] = useState({
        firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: ''
    });
    const [editEmployee, setEditEmployee] = useState(null);
    const [absenceData, setAbsenceData] = useState({
        employeeId: '', startDate: '', endDate: '', reason: ''
    });
    const [absenceErrors, setAbsenceErrors] = useState({
        employeeId: '', startDate: '', endDate: '', reason: ''
    });
    const [showAbsenceModal, setShowAbsenceModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAbsenceListModal, setShowAbsenceListModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 5;

    const API_URL = 'http://localhost:5000/api';

    const validateName = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return PATTERNS.name.test(value.trim()) ? '' : ERROR_MESSAGES.invalidName;
    }, []);

    const validatePosition = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return PATTERNS.position.test(value.trim()) ? '' : ERROR_MESSAGES.invalidPosition;
    }, []);

    const validateSalary = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return PATTERNS.salary.test(value) && Number(value) >= 0 ? '' : ERROR_MESSAGES.invalidSalary;
    }, []);

    const validateDate = useCallback((value, allowFuture = false) => {
        if (!value) return ERROR_MESSAGES.required;
        if (!PATTERNS.date.test(value)) return ERROR_MESSAGES.invalidDate;
        const [year] = value.split('-').map(Number);
        if (year < 2000) return ERROR_MESSAGES.pastLimit;
        const date = new Date(value);
        const now = new Date();
        return allowFuture || date <= now ? '' : ERROR_MESSAGES.futureDate;
    }, []);

    const validateReason = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return PATTERNS.reason.test(value.trim()) ? '' : ERROR_MESSAGES.invalidReason;
    }, []);

    const validateEmployeeId = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return employees.some(emp => emp._id === value) ? '' : 'Invalid employee';
    }, [employees]);

    const validateBusinessId = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return businesses.some(biz => biz._id === value) ? '' : 'Invalid business';
    }, [businesses]);

    const debouncedValidate = useCallback(
        debounce((name, value, isAbsence = false) => {
            let error = '';
            switch (name) {
                case 'firstName':
                case 'lastName': error = validateName(value); break;
                case 'position': error = validatePosition(value); break;
                case 'salary': error = validateSalary(value); break;
                case 'hireDate': error = validateDate(value); break;
                case 'businessId': error = validateBusinessId(value); break;
                case 'employeeId': error = validateEmployeeId(value); break;
                case 'startDate':
                case 'endDate': error = validateDate(value, true); break;
                case 'reason': error = validateReason(value); break;
                default: break;
            }
            if (isAbsence) {
                setAbsenceErrors(prev => ({ ...prev, [name]: error }));
            } else {
                setFormErrors(prev => ({ ...prev, [name]: error }));
            }
        }, 300),
        [validateName, validatePosition, validateSalary, validateDate, validateReason, validateEmployeeId, validateBusinessId]
    );

    useEffect(() => {
        fetchBusinesses();
        fetchEmployees();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(prev => ({ ...prev, fetch: true }));
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/business/user-businesses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinesses(response.data.businesses || []);
            if (response.data.businesses.length > 0 && !formData.businessId) {
                setFormData(prev => ({ ...prev, businessId: response.data.businesses[0]._id }));
            }
        } catch (err) {
            setError('Failed to load businesses');
        } finally {
            setLoading(prev => ({ ...prev, fetch: false }));
        }
    };

    const fetchEmployees = async () => {
        setLoading(prev => ({ ...prev, fetch: true }));
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.employees || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(prev => ({ ...prev, fetch: false }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        debouncedValidate(name, value);
        setError('');
    };

    const handleAbsenceInputChange = (e) => {
        const { name, value } = e.target;
        setAbsenceData(prev => ({ ...prev, [name]: value }));
        debouncedValidate(name, value, true);
        setError('');
    };

    const validateForm = () => {
        const errors = {
            firstName: validateName(formData.firstName),
            lastName: validateName(formData.lastName),
            position: validatePosition(formData.position),
            salary: validateSalary(formData.salary),
            hireDate: validateDate(formData.hireDate),
            businessId: validateBusinessId(formData.businessId)
        };
        setFormErrors(errors);
        return Object.values(errors).every(error => !error);
    };

    const validateAbsence = () => {
        const errors = {
            employeeId: validateEmployeeId(absenceData.employeeId),
            startDate: validateDate(absenceData.startDate, true),
            endDate: validateDate(absenceData.endDate, true),
            reason: validateReason(absenceData.reason)
        };
        if (!errors.startDate && !errors.endDate) {
            const start = new Date(absenceData.startDate);
            const end = new Date(absenceData.endDate);
            if (start > end) errors.endDate = ERROR_MESSAGES.invalidDateRange;
        }
        setAbsenceErrors(errors);
        return Object.values(errors).every(error => !error);
    };

    const handleSubmit = async (e, isUpdate = false) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(prev => ({ ...prev, submit: true }));
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            const url = isUpdate ? `${API_URL}/employees/${editEmployee._id}` : `${API_URL}/employees`;
            const method = isUpdate ? axios.put : axios.post;
            const response = await method(url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (isUpdate) {
                setEmployees(employees.map(emp => emp._id === editEmployee._id ? response.data.employee : emp));
                setEditEmployee(null);
                setShowEditModal(false);
            } else {
                setEmployees([...employees, response.data.employee]);
            }
            setSuccess(isUpdate ? 'Employee updated successfully!' : 'Employee added successfully!');
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'add'} employee`);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleEditEmployee = (employee) => {
        setEditEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            salary: employee.salary.toString(),
            hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
            businessId: employee.businessId._id || employee.businessId
        });
        setFormErrors({ firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: '' });
        setShowEditModal(true);
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(employees.filter(emp => emp._id !== id));
            setSuccess('Employee deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete employee');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleAddAbsence = async () => {
        if (!validateAbsence()) return;
        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/employees/${absenceData.employeeId}/absences`, absenceData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(employees.map(emp => emp._id === absenceData.employeeId ? response.data.employee : emp));
            setSuccess('Absence recorded successfully!');
            setShowAbsenceModal(false);
            setAbsenceData({ employeeId: '', startDate: '', endDate: '', reason: '' });
            setAbsenceErrors({ employeeId: '', startDate: '', endDate: '', reason: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add absence');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: businesses[0]?._id || '' });
        setFormErrors({ firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: '' });
        setEditEmployee(null);
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * employeesPerPage,
        currentPage * employeesPerPage
    );
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><FaUserPlus /> Team Management</h2>
            {error && <Alert color="danger" className={styles.alert}>{error}</Alert>}
            {success && <Alert color="success" className={styles.alert}>{success}</Alert>}
            {(loading.fetch || loading.submit) && (
                <div className={styles.spinner}><FaSpinner className="fa-spin" /> Loading...</div>
            )}

            {/* Form to add an employee */}
            <Card className={styles.card}>
                <CardTitle tag="h3" className={styles.cardTitle}>Add a New Team Member</CardTitle>
                <CardBody>
                    <div className={styles.form}>
                        <FormGroup className={styles.field}>
                            <Label>First Name</Label>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.firstName}
                                placeholder="Enter first name"
                                required
                            />
                            <FormFeedback>{formErrors.firstName}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Last Name</Label>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.lastName}
                                placeholder="Enter last name"
                                required
                            />
                            <FormFeedback>{formErrors.lastName}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Position</Label>
                            <Input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.position}
                                placeholder="Enter position"
                                required
                            />
                            <FormFeedback>{formErrors.position}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Salary (TND)</Label>
                            <Input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.salary}
                                placeholder="Enter salary"
                                required
                                min="0"
                                step="0.01"
                            />
                            <FormFeedback>{formErrors.salary}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Hire Date</Label>
                            <Input
                                type="date"
                                name="hireDate"
                                value={formData.hireDate}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.hireDate}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <FormFeedback>{formErrors.hireDate}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Business</Label>
                            <Input
                                type="select"
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit || !businesses.length}
                                invalid={!!formErrors.businessId}
                                required
                            >
                                <option value="">Select a business</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>{business.name}</option>
                                ))}
                            </Input>
                            <FormFeedback>{formErrors.businessId}</FormFeedback>
                        </FormGroup>
                        <Button
                            color="primary"
                            className={styles.submitButton}
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={loading.submit || Object.values(formErrors).some(err => !!err)}
                        >
                            {loading.submit ? <FaSpinner className="fa-spin" /> : 'Add'}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Employee list */}
            <div className={styles.employeeList}>
                <div className={styles.listHeader}>
                    <h3 className={styles.subtitle}>Your Team ({filteredEmployees.length})</h3>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search for an employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                {paginatedEmployees.length === 0 ? (
                    <Alert color="info" className={styles.noDataAlert}>
                        No team members yet. Add some above!
                    </Alert>
                ) : (
                    <Table className={styles.employeeTable} responsive>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Salary</th>
                            <th>Hire Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedEmployees.map(employee => (
                            <tr key={employee._id} className={styles.employeeRow}>
                                <td>{employee.firstName} {employee.lastName}</td>
                                <td>{employee.position}</td>
                                <td>{employee.salary} TND</td>
                                <td>{new Date(employee.hireDate).toLocaleDateString('en-US')}</td>
                                <td>
                                    <Badge className={styles.statusBadge} color={employee.absences?.some(abs => new Date(abs.startDate) <= new Date() && new Date(abs.endDate) >= new Date()) ? 'warning' : 'success'}>
                                        {employee.absences?.some(abs => new Date(abs.startDate) <= new Date() && new Date(abs.endDate) >= new Date()) ? 'Absent' : 'Active'}
                                    </Badge>
                                </td>
                                <td className={styles.actionButtons}>
                                    <Button size="sm" color="info" onClick={() => handleEditEmployee(employee)} disabled={loading.submit}><FaEdit /></Button>
                                    <Button size="sm" color="danger" onClick={() => handleDeleteEmployee(employee._id)} disabled={loading.submit}><FaTrash /></Button>
                                    <Button size="sm" color="warning" onClick={() => {
                                        setAbsenceData({ employeeId: employee._id, startDate: '', endDate: '', reason: '' });
                                        setShowAbsenceModal(true);
                                    }} disabled={loading.submit}><FaCalendarAlt /></Button>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setShowAbsenceListModal(true);
                                        }} 
                                        disabled={loading.submit}
                                    >
                                        View Absences
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={styles.pageButton}>Previous</Button>
                        <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className={styles.pageButton}>Next</Button>
                    </div>
                )}
            </div>

            {/* Modal to edit an employee */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} className={styles.modal}>
                <ModalHeader toggle={() => setShowEditModal(false)} className={styles.modalHeader}>Edit Employee</ModalHeader>
                <ModalBody>
                    <div className={styles.form}>
                        <FormGroup className={styles.field}>
                            <Label>First Name</Label>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.firstName}
                                required
                            />
                            <FormFeedback>{formErrors.firstName}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Last Name</Label>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.lastName}
                                required
                            />
                            <FormFeedback>{formErrors.lastName}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Position</Label>
                            <Input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.position}
                                required
                            />
                            <FormFeedback>{formErrors.position}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Salary (TND)</Label>
                            <Input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.salary}
                                required
                                min="0"
                                step="0.01"
                            />
                            <FormFeedback>{formErrors.salary}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Hire Date</Label>
                            <Input
                                type="date"
                                name="hireDate"
                                value={formData.hireDate}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit}
                                invalid={!!formErrors.hireDate}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <FormFeedback>{formErrors.hireDate}</FormFeedback>
                        </FormGroup>
                        <FormGroup className={styles.field}>
                            <Label>Business</Label>
                            <Input
                                type="select"
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit || !businesses.length}
                                invalid={!!formErrors.businessId}
                                required
                            >
                                <option value="">Select a business</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>{business.name}</option>
                                ))}
                            </Input>
                            <FormFeedback>{formErrors.businessId}</FormFeedback>
                        </FormGroup>
                    </div>
                </ModalBody>
                <ModalFooter className={styles.modalFooter}>
                    <Button
                        color="primary"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading.submit || Object.values(formErrors).some(err => !!err)}
                    >
                        {loading.submit ? <FaSpinner className="fa-spin" /> : 'Update'}
                    </Button>
                    <Button color="secondary" onClick={() => { setShowEditModal(false); resetForm(); }} disabled={loading.submit}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Absence Modal */}
            <Modal isOpen={showAbsenceModal} toggle={() => setShowAbsenceModal(false)} className={styles.modal}>
                <ModalHeader toggle={() => setShowAbsenceModal(false)} className={styles.modalHeader}>Record an Absence</ModalHeader>
                <ModalBody>
                    <FormGroup className={styles.field}>
                        <Label>Employee</Label>
                        <Input
                            type="select"
                            name="employeeId"
                            value={absenceData.employeeId}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit || employees.length === 0}
                            invalid={!!absenceErrors.employeeId}
                            required
                        >
                            <option value="">Select an employee</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.position})
                                </option>
                            ))}
                        </Input>
                        <FormFeedback>{absenceErrors.employeeId}</FormFeedback>
                    </FormGroup>
                    <FormGroup className={styles.field}>
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            name="startDate"
                            value={absenceData.startDate}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit}
                            invalid={!!absenceErrors.startDate}
                            required
                        />
                        <FormFeedback>{absenceErrors.startDate}</FormFeedback>
                    </FormGroup>
                    <FormGroup className={styles.field}>
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            name="endDate"
                            value={absenceData.endDate}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit}
                            invalid={!!absenceErrors.endDate}
                            required
                        />
                        <FormFeedback>{absenceErrors.endDate}</FormFeedback>
                    </FormGroup>
                    <FormGroup className={styles.field}>
                        <Label>Reason</Label>
                        <Input
                            type="text"
                            name="reason"
                            value={absenceData.reason}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit}
                            invalid={!!absenceErrors.reason}
                            placeholder="Reason for absence"
                            required
                        />
                        <FormFeedback>{absenceErrors.reason}</FormFeedback>
                    </FormGroup>
                </ModalBody>
                <ModalFooter className={styles.modalFooter}>
                    <Button
                        color="primary"
                        onClick={handleAddAbsence}
                        disabled={loading.submit || Object.values(absenceErrors).some(err => !!err)}
                    >
                        {loading.submit ? <FaSpinner className="fa-spin" /> : 'Save'}
                    </Button>
                    <Button color="secondary" onClick={() => setShowAbsenceModal(false)} disabled={loading.submit}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Absence List Modal */}
            <Modal isOpen={showAbsenceListModal} toggle={() => setShowAbsenceListModal(false)} className={styles.modal}>
                <ModalHeader toggle={() => setShowAbsenceListModal(false)} className={styles.modalHeader}>
                    {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s Absences` : 'Absences'}
                </ModalHeader>
                <ModalBody>
                    {selectedEmployee && selectedEmployee.absences && selectedEmployee.absences.length > 0 ? (
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedEmployee.absences.map((absence, index) => {
                                    const startDate = new Date(absence.startDate);
                                    const endDate = new Date(absence.endDate);
                                    const now = new Date();
                                    let status = 'Completed';
                                    if (now >= startDate && now <= endDate) {
                                        status = 'Current';
                                    } else if (now < startDate) {
                                        status = 'Upcoming';
                                    }
                                    
                                    return (
                                        <tr key={index}>
                                            <td>{startDate.toLocaleDateString()}</td>
                                            <td>{endDate.toLocaleDateString()}</td>
                                            <td>{absence.reason}</td>
                                            <td>
                                                <Badge color={
                                                    status === 'Current' ? 'warning' :
                                                    status === 'Upcoming' ? 'info' : 'success'
                                                }>
                                                    {status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert color="info">
                            No absences recorded for this employee.
                        </Alert>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAbsenceListModal(false)}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;