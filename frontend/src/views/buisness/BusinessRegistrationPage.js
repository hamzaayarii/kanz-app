import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
    FormFeedback
} from 'reactstrap';

// Country and state data
const countries = [
    { name: "Tunisia", code: "TN", states: ["Tunis", "Sfax", "Sousse", "Ariana", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jijel", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul", "Sidi Bouzid", "Siliana", "Tataouine", "Tozeur", "Zaghouan"] },
    { name: "United States", code: "US", states: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"] },
    { name: "France", code: "FR", states: ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"] },
    { name: "Morocco", code: "MA", states: ["Tanger-Tétouan-Al Hoceima", "L'Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra", "Béni Mellal-Khénifra", "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet", "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab"] },
    { name: "Algeria", code: "DZ", states: ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"] },
    // Add more countries as needed
];

// Business types for Tunisia
const businessTypes = [
    "SARL (Société à Responsabilité Limitée)",
    "SUARL (Société Unipersonnelle à Responsabilité Limitée)",
    "SA (Société Anonyme)",
    "SAS (Société par Actions Simplifiée)",
    "Entreprise Individuelle",
    "Auto-entrepreneur",
    "Société en Nom Collectif",
    "Société en Commandite Simple",
    "Société en Commandite par Actions",
    "Société Civile Professionnelle",
    "Société Civile Immobilière",
    "SARL de Famille",
    "Groupement d'Intérêt Économique"
];

// Validation patterns
const validationPatterns = {
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    taxNumber: /^\d{8}[A-Z](\/[A-Z])?\/\d{3}$/, // Format like 12345678A/M/000
    rneNumber: /^\d{11}$/ // Keep this the same
};

// Validation rules and error messages
const validationRules = {
    name: {
        required: true,
        minLength: 3,
        message: {
            required: 'Organization name is required',
            minLength: 'Organization name must be at least 3 characters'
        }
    },
    address: {
        required: true,
        minLength: 5,
        message: {
            required: 'Organization address is required',
            minLength: 'Address must be at least 5 characters'
        }
    },
    country: {
        required: true,
        message: {
            required: 'Country is required'
        }
    },
    state: {
        required: true,
        message: {
            required: 'State/Province is required'
        }
    },
    type: {
        required: true,
        message: {
            required: 'Organization type is required'
        }
    },
    taxNumber: {
        required: true,
        pattern: validationPatterns.taxNumber,
        message: {
            required: 'Tax number is required',
            pattern: 'Tax number should be in format 12345678A/M/000'
        }
    },
    rneNumber: {
        required: true,
        pattern: /^\d{11}$/,
        message: {
            required: 'RNE number is required',
            pattern: 'RNE number should be exactly 11 digits'
        }
    },
    phone: {
        required: true,
        pattern: validationPatterns.phone,
        message: {
            required: 'Phone number is required',
            pattern: 'Please enter a valid phone number'
        }
    },
    email: {
        required: false,
        pattern: validationPatterns.email,
        message: {
            pattern: 'Please enter a valid email address'
        }
    },
    capital: {
        required: false,
        min: 0,
        message: {
            min: 'Capital cannot be negative'
        }
    }
};

const BusinessRegistrationPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        country: 'Tunisia',
        state: '',
        type: '',
        taxNumber: '',
        rneNumber: '',
        phone: '',
        businessActivity: '',
        capital: '',
        vatRegistration: false,
        exportOriented: false,
        employeeCount: '1-5',
        email: '',
    });

    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    
    // Set default states for Tunisia
    useEffect(() => {
        const tunisiaStates = countries.find(country => country.name === "Tunisia")?.states || [];
        setAvailableStates(tunisiaStates);
    }, []);

    useEffect(() => {
        // Check user role when component mounts
        const checkUserRole = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Debug the response
                console.log('Response data:', response.data);

                // The response.data is the user object directly
                if (response.data.role === 'accountant') {
                    navigate('/admin/journal');
                    return;
                }
            } catch (error) {
                console.error('Error checking user role:', error);
                // Add more detailed error logging
                if (error.response) {
                    console.log('Response data:', error.response.data);
                    console.log('Response status:', error.response.status);
                }
                navigate('/auth/login');
            }
        };

        checkUserRole();
    }, [navigate]);

    // Check if user is authenticated and redirect if they already have a business
    useEffect(() => {
        const fetchBusinesses = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/business/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBusinesses(response.data.businesses);
            } catch (error) {
                console.error('Error fetching businesses:', error);
            }
        };

        fetchBusinesses();
    }, [navigate]);

    // Real-time validation of individual fields
    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return '';
        
        // Check if required and empty
        if (rules.required && !value.trim()) {
            return rules.message.required;
        }
        
        // Check minimum length
        if (rules.minLength && value.trim().length < rules.minLength) {
            return rules.message.minLength;
        }
        
        // Check minimum value for numbers
        if (rules.min !== undefined && value !== '' && Number(value) < rules.min) {
            return rules.message.min;
        }
        
        // Check pattern
        if (rules.pattern && value.trim() && !rules.pattern.test(value.trim())) {
            return rules.message.pattern;
        }
        
        return '';
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {};
        Object.keys(validationRules).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle checkbox values
        const inputValue = type === 'checkbox' ? checked : value;
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: inputValue
        }));
        
        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate field on change
        const errorMessage = validateField(name, inputValue);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
        
        // If country changes, update available states
        if (name === 'country') {
            const selectedCountry = countries.find(country => country.name === value);
            setAvailableStates(selectedCountry?.states || []);
            
            // Reset state when country changes
            setFormData(prev => ({
                ...prev,
                country: value,
                state: ''
            }));
        }
    };

    // Handle field blur for validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate field on blur
        const errorMessage = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched when submitting
        const allTouched = {};
        Object.keys(validationRules).forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/business/register',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setLoading(false);

            if (response.data.success) {
                // After registering a new business, refresh the list and go to dashboard
                navigate('/admin/index');
            } else {
                setErrors({ general: response.data.message || 'Failed to register business' });
            }
        } catch (error) {
            setLoading(false);
            console.error('Business registration error:', error);
            setErrors({
                general: error.response?.data?.message || 'An error occurred during registration'
            });
        }
    };

    // Show error only if field is touched
    const showError = (fieldName) => {
        return touched[fieldName] && errors[fieldName];
    };

    // Get field validation status
    const getFieldStatus = (fieldName) => {
        return touched[fieldName] ? (errors[fieldName] ? 'danger' : 'success') : null;
    };

    // Get form completion percentage
    const getCompletionPercentage = () => {
        const requiredFields = Object.keys(validationRules).filter(
            field => validationRules[field].required
        );
        
        const completedFields = requiredFields.filter(
            field => formData[field] && !errors[field]
        );
        
        return Math.round((completedFields.length / requiredFields.length) * 100);
    };

    const completionPercentage = getCompletionPercentage();

    return (
        <div className="main-content">
            <div className="header bg-gradient-primary py-7 py-lg-8">
                <Container>
                    <div className="header-body text-center mb-5">
                        <Row className="justify-content-center">
                            <Col lg="8" md="8">
                                <h1 className="text-white">Welcome to Your Business Registration</h1>
                                <p className="text-lead text-white">
                                    Before you can access the dashboard, please register your business.
                                </p>
                            </Col>
                        </Row>
                    </div>
                </Container>

                <div className="separator separator-bottom separator-skew zindex-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                        version="1.1"
                        viewBox="0 0 2560 100"
                        x="0"
                        y="0"
                    >
                        <polygon
                            className="fill-default"
                            points="2560 0 2560 100 0 100"
                        />
                    </svg>
                </div>
            </div>
            <Container className="mt--8 pb-5">
                <Row className="justify-content-center">
                    <Col lg="8" md="10">
                        <Card className="bg-secondary shadow border-0">
                            <CardHeader className="bg-transparent d-flex justify-content-start align-items-center">
                                <Button
                                    color="primary"
                                    onClick={() => window.location.href = "/admin/index"}
                                    className="btn-sm"
                                >
                                    <i className="fas fa-arrow-left me-2"></i> Back to Dashboard
                                </Button>
                                <div className="text-center flex-grow-1">
                                    <h3>Business Registration</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="px-lg-5 py-lg-5">
                                {/* Form Completion Progress */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Form Completion</span>
                                        <span>{completionPercentage}%</span>
                                    </div>
                                    <div className="progress">
                                        <div 
                                            className={`progress-bar bg-${completionPercentage === 100 ? 'success' : 'primary'}`}
                                            role="progressbar" 
                                            style={{ width: `${completionPercentage}%` }}
                                            aria-valuenow={completionPercentage} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        />
                                    </div>
                                </div>
                                
                                {errors.general && (
                                    <div className="text-center mb-3 alert alert-danger">
                                        <small>{errors.general}</small>
                                    </div>
                                )}
                                <Form role="form" onSubmit={handleSubmit}>
                                    <h6 className="heading-small text-muted mb-4">Basic Business Information</h6>
                                    <Row>
                                        <Col md="12">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Organization Name*
                                                    {touched.name && !errors.name && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="name"
                                                    placeholder="Enter your organization name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('name')}
                                                    valid={touched.name && !errors.name}
                                                />
                                                <FormFeedback>{errors.name}</FormFeedback>
                                                <small className="form-text text-muted">
                                                    Must be at least 3 characters
                                                </small>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Country*
                                                    {touched.country && !errors.country && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="country"
                                                    type="select"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('country')}
                                                    valid={touched.country && !errors.country}
                                                >
                                                    {countries.map(country => (
                                                        <option key={country.code} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </Input>
                                                <FormFeedback>{errors.country}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    State/Province*
                                                    {touched.state && !errors.state && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="state"
                                                    type="select"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('state')}
                                                    valid={touched.state && !errors.state}
                                                >
                                                    <option value="">Select State/Province</option>
                                                    {availableStates.map(state => (
                                                        <option key={state} value={state}>
                                                            {state}
                                                        </option>
                                                    ))}
                                                </Input>
                                                <FormFeedback>{errors.state}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <FormGroup>
                                        <label className="form-control-label">
                                            Organization Address*
                                            {touched.address && !errors.address && (
                                                <i className="fas fa-check-circle text-success ml-2"></i>
                                            )}
                                        </label>
                                        <Input
                                            className="form-control-alternative"
                                            name="address"
                                            placeholder="Enter detailed address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={showError('address')}
                                            valid={touched.address && !errors.address}
                                        />
                                        <FormFeedback>{errors.address}</FormFeedback>
                                        <small className="form-text text-muted">
                                            Must be at least 5 characters
                                        </small>
                                    </FormGroup>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Legal Structure*
                                                    {touched.type && !errors.type && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="type"
                                                    type="select"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('type')}
                                                    valid={touched.type && !errors.type}
                                                >
                                                    <option value="">Select legal structure</option>
                                                    {businessTypes.map(type => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </Input>
                                                <FormFeedback>{errors.type}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Business Activity/Sector</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="businessActivity"
                                                    placeholder="Ex: Retail, Software, Food Service"
                                                    type="text"
                                                    value={formData.businessActivity}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                    <Col md="6">
                                    <FormGroup>
  <label className="form-control-label">
    Tax Number (Matricule Fiscal)*
    {touched.taxNumber && !errors.taxNumber && (
      <i className="fas fa-check-circle text-success ml-2"></i>
    )}
  </label>
  <Input
    className="form-control-alternative"
    name="taxNumber"
    placeholder="e.g. 12345678A/M/000"
    type="text"
    value={formData.taxNumber}
    onChange={handleChange}
    onBlur={handleBlur}
    invalid={showError('taxNumber')}
    valid={touched.taxNumber && !errors.taxNumber}
    pattern="^\d{8}[A-Z](\/[A-Z])?\/\d{3}$"
  />
  <FormFeedback>{errors.taxNumber}</FormFeedback>
  <small className="form-text text-muted">
    Format: 12345678A/M/000
  </small>
</FormGroup>
</Col>

                                        <Col md="6">
                                        <FormGroup>
  <label className="form-control-label">
    Numéro RNE*
    {touched.rneNumber && !errors.rneNumber && formData.rneNumber && (
      <i className="fas fa-check-circle text-success ml-2"></i>
    )}
  </label>
  <Input
    className="form-control-alternative"
    name="rneNumber"
    placeholder="e.g. 12345678901"
    type="text"
    value={formData.rneNumber}
    onChange={handleChange}
    onBlur={handleBlur}
    invalid={showError('rneNumber')}
    valid={touched.rneNumber && !errors.rneNumber && formData.rneNumber}
    pattern="^\d{11}$"
/>
  <FormFeedback>{errors.rneNumber}</FormFeedback>
  <small className="form-text text-muted">
    Required - Should be 11 digits
  </small>
</FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Phone Number*
                                                    {touched.phone && !errors.phone && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="phone"
                                                    placeholder="e.g. +216 12 345 678"
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('phone')}
                                                    valid={touched.phone && !errors.phone}
                                                />
                                                <FormFeedback>{errors.phone}</FormFeedback>
                                                <small className="form-text text-muted">
                                                    Enter a valid phone number with country code
                                                </small>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Proposed Capital (TND)</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="capital"
                                                    placeholder="Ex: 1000"
                                                    type="number"
                                                    value={formData.capital}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('capital')}
                                                    valid={touched.capital && !errors.capital && formData.capital}
                                                />
                                                <FormFeedback>{errors.capital}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Expected Number of Employees</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="employeeCount"
                                                    type="select"
                                                    value={formData.employeeCount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                >
                                                    <option value="1-5">1-5</option>
                                                    <option value="6-10">6-10</option>
                                                    <option value="11-20">11-20</option>
                                                    <option value="21-50">21-50</option>
                                                    <option value="50+">50+</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Business Email
                                                    {touched.email && !errors.email && formData.email && (
                                                        <i className="fas fa-check-circle text-success ml-2"></i>
                                                    )}
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="email"
                                                    placeholder="e.g. business@example.com"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    invalid={showError('email')}
                                                    valid={touched.email && !errors.email && formData.email}
                                                />
                                                <FormFeedback>{errors.email}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup check className="mb-3 mt-3">
                                                <Input
                                                    type="checkbox"
                                                    name="vatRegistration"
                                                    id="vatRegistration"
                                                    checked={formData.vatRegistration}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="vatRegistration">
                                                    VAT Registration
                                                </label>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup check className="mb-3 mt-3">
                                                <Input
                                                    type="checkbox"
                                                    name="exportOriented"
                                                    id="exportOriented"
                                                    checked={formData.exportOriented}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="exportOriented">
                                                    Export Oriented Business
                                                </label>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <div className="text-center">
                                        <Button
                                            className="my-4"
                                            color={completionPercentage === 100 ? "success" : "primary"}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registering...' : 'Register Business'}
                                        </Button>
                                    </div>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusinessRegistrationPage;