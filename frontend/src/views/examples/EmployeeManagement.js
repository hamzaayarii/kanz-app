import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, CardTitle, Input, Label, FormFeedback, FormGroup } from 'reactstrap';
import { FaUserPlus, FaUpload, FaEdit, FaTrash, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import styles from '../../assets/css/EmployeeManagement.module.css';

// Validation regex patterns
const PATTERNS = {
    name: /^[a-zA-Z\s-]{2,50}$/,
    position: /^[a-zA-Z\s-]{2,100}$/,
    salary: /^\d+(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    reason: /^.{2,200}$/,
};

// Messages d'erreur personnalisés
const ERROR_MESSAGES = {
    required: 'Ce champ est requis',
    invalidName: '2-50 caractères, lettres uniquement',
    invalidPosition: '2-100 caractères, lettres uniquement',
    invalidSalary: 'Nombre positif requis',
    invalidDate: 'Format YYYY-MM-DD requis',
    pastLimit: 'Date antérieure à 2000 non permise',
    futureDate: 'Date future non permise',
    invalidReason: '2-200 caractères requis',
    invalidDateRange: 'Date de fin doit être après date de début',
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
    const [importData, setImportData] = useState('');
    const [absenceData, setAbsenceData] = useState({
        employeeId: '', startDate: '', endDate: '', reason: ''
    });
    const [absenceErrors, setAbsenceErrors] = useState({
        employeeId: '', startDate: '', endDate: '', reason: ''
    });
    const [showAbsenceModal, setShowAbsenceModal] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    // Validation avancée
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
        return employees.some(emp => emp._id === value) ? '' : 'Employé invalide';
    }, [employees]);

    const validateBusinessId = useCallback((value) => {
        if (!value) return ERROR_MESSAGES.required;
        return businesses.some(biz => biz._id === value) ? '' : 'Entreprise invalide';
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
            const response = await axios.get(`${API_URL}/business/buisnessowner`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinesses(response.data.businesses || []);
            if (response.data.businesses.length > 0 && !formData.businessId) {
                setFormData(prev => ({ ...prev, businessId: response.data.businesses[0]._id }));
            }
        } catch (err) {
            setError('Échec du chargement des entreprises');
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
            setError(err.response?.data?.message || 'Échec du chargement des employés');
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
            } else {
                setEmployees([...employees, response.data.employee]);
            }
            setSuccess(isUpdate ? 'Employé mis à jour avec succès !' : 'Employé ajouté avec succès !');
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || `Échec de ${isUpdate ? 'la mise à jour' : 'l\'ajout'} de l'employé`);
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
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(employees.filter(emp => emp._id !== id));
            setSuccess('Employé supprimé avec succès !');
        } catch (err) {
            setError(err.response?.data?.message || 'Échec de la suppression de l\'employé');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleImportEmployees = async () => {
        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const employeesToImport = JSON.parse(importData);
            if (!Array.isArray(employeesToImport) || employeesToImport.length === 0) {
                throw new Error('Veuillez fournir un tableau JSON valide');
            }
            employeesToImport.forEach(emp => {
                if (validateName(emp.firstName) || validateName(emp.lastName) || validatePosition(emp.position) ||
                    validateSalary(emp.salary) || validateDate(emp.hireDate) || !emp.businessId) {
                    throw new Error('Tous les champs des employés doivent être valides dans le JSON');
                }
            });
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/employees/import`, { employees: employeesToImport }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees([...employees, ...response.data.employees]);
            setSuccess('Employés importés avec succès !');
            setImportData('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Échec de l\'importation des employés');
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
            setSuccess('Absence enregistrée avec succès !');
            setShowAbsenceModal(false);
            setAbsenceData({ employeeId: '', startDate: '', endDate: '', reason: '' });
            setAbsenceErrors({ employeeId: '', startDate: '', endDate: '', reason: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Échec de l\'ajout de l\'absence');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: businesses[0]?._id || '' });
        setFormErrors({ firstName: '', lastName: '', position: '', salary: '', hireDate: '', businessId: '' });
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><FaUserPlus /> Tableau de Bord Équipe</h2>
            {error && <Alert color="danger" className={styles.alert}>{error}</Alert>}
            {success && <Alert color="success" className={styles.alert}>{success}</Alert>}
            {(loading.fetch || loading.submit) && (
                <div className={styles.spinner}><FaSpinner className="fa-spin" /> Chargement...</div>
            )}

            {/* Formulaire employé (similaire au modal d'absence) */}
            <Card className={styles.card}>
                <CardTitle tag="h3" className={styles.cardTitle}>
                    {editEmployee ? 'Mettre à jour un Membre' : 'Ajouter un Nouveau Membre'}
                </CardTitle>
                <CardBody>
                    <div className={styles.form}>
                        <FormGroup className={styles.field}>
                            <Label>Prénom</Label>
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
                            <Label>Nom</Label>
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
                            <Label>Poste</Label>
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
                            <Label>Salaire (TND)</Label>
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
                            <Label>Date d'embauche</Label>
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
                            <Label>Entreprise</Label>
                            <Input
                                type="select"
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleInputChange}
                                disabled={loading.fetch || loading.submit || !businesses.length}
                                invalid={!!formErrors.businessId}
                                required
                            >
                                <option value="">Sélectionnez une entreprise</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>{business.name}</option>
                                ))}
                            </Input>
                            <FormFeedback>{formErrors.businessId}</FormFeedback>
                        </FormGroup>
                        <div className={styles.buttonGroup}>
                            <Button
                                color="primary"
                                onClick={(e) => handleSubmit(e, !!editEmployee)}
                                disabled={loading.submit || Object.values(formErrors).some(err => !!err)}
                            >
                                {loading.submit ? <FaSpinner className="fa-spin" /> : editEmployee ? 'Mettre à jour' : 'Ajouter'}
                            </Button>
                            {editEmployee && (
                                <Button
                                    color="secondary"
                                    onClick={() => { setEditEmployee(null); resetForm(); }}
                                    disabled={loading.submit}
                                    className={styles.cancelButton}
                                >
                                    Annuler
                                </Button>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Liste des employés */}
            <div className={styles.employeeList}>
                <h3 className={styles.subtitle}>Votre Équipe</h3>
                {employees.length === 0 && !loading.fetch && !error ? (
                    <Alert color="warning">Aucun membre d'équipe pour l'instant. Ajoutez-en ci-dessus !</Alert>
                ) : (
                    employees.map(employee => (
                        <Card key={employee._id} className={styles.employeeCard}>
                            <CardBody>
                                <div className={styles.employeeInfo}>
                                    <h4>{employee.firstName} {employee.lastName}</h4>
                                    <p><strong>Rôle:</strong> {employee.position}</p>
                                    <p><strong>Salaire:</strong> {employee.salary} TND</p>
                                    <p><strong>Embauché:</strong> {new Date(employee.hireDate).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Entreprise:</strong> {employee.businessId?.name || 'N/A'}</p>
                                    {employee.absences?.length > 0 && (
                                        <div className={styles.absences}>
                                            <strong>Absences:</strong>
                                            <ul>
                                                {employee.absences.map((absence, idx) => (
                                                    <li key={idx}>
                                                        {new Date(absence.startDate).toLocaleDateString('fr-FR')} - {new Date(absence.endDate).toLocaleDateString('fr-FR')}: {absence.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.employeeActions}>
                                    <Button color="success" onClick={() => handleEditEmployee(employee)} disabled={loading.submit}><FaEdit /> Modifier</Button>
                                    <Button color="danger" onClick={() => handleDeleteEmployee(employee._id)} disabled={loading.submit}><FaTrash /> Supprimer</Button>
                                    <Button color="warning" onClick={() => { setAbsenceData({ ...absenceData, employeeId: employee._id }); setShowAbsenceModal(true); }} disabled={loading.submit}><FaCalendarAlt /> Absence</Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal Absence */}
            <Modal isOpen={showAbsenceModal} toggle={() => setShowAbsenceModal(false)} className={styles.modal}>
                <ModalHeader toggle={() => setShowAbsenceModal(false)}>Enregistrer une Absence</ModalHeader>
                <ModalBody>
                    <FormGroup className={styles.field}>
                        <Label>Employé</Label>
                        <Input
                            type="select"
                            name="employeeId"
                            value={absenceData.employeeId}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit}
                            invalid={!!absenceErrors.employeeId}
                            required
                        >
                            <option value="">Sélectionnez un employé</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </Input>
                        <FormFeedback>{absenceErrors.employeeId}</FormFeedback>
                    </FormGroup>
                    <FormGroup className={styles.field}>
                        <Label>Date de début</Label>
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
                        <Label>Date de fin</Label>
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
                        <Label>Raison</Label>
                        <Input
                            type="text"
                            name="reason"
                            value={absenceData.reason}
                            onChange={handleAbsenceInputChange}
                            disabled={loading.fetch || loading.submit}
                            invalid={!!absenceErrors.reason}
                            required
                        />
                        <FormFeedback>{absenceErrors.reason}</FormFeedback>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={handleAddAbsence}
                        disabled={loading.submit || Object.values(absenceErrors).some(err => !!err)}
                    >
                        {loading.submit ? <FaSpinner className="fa-spin" /> : 'Enregistrer'}
                    </Button>
                    <Button color="secondary" onClick={() => setShowAbsenceModal(false)} disabled={loading.submit}>Annuler</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;