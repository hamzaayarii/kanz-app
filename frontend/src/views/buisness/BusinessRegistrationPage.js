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
    { name: "Tunisia", code: "TN", states: ["Tunis", "Sfax", "Sousse", "Ariana", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul", "Sidi Bouzid", "Siliana", "Tataouine", "Tozeur", "Zaghouan"] },
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

const BusinessRegistrationPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        country: 'Tunisia', // Default to Tunisia
        state: '',
        type: '',
        taxNumber: '',
        phone: '',
        legalStructure: '',
        businessActivity: '',
        capital: '',
        vatRegistration: false,
        exportOriented: false,
        employeeCount: '1-5'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    
    // Set default states for Tunisia
    useEffect(() => {
        const tunisiaStates = countries.find(country => country.name === "Tunisia")?.states || [];
        setAvailableStates(tunisiaStates);
    }, []);

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Organization name is required';
        if (!formData.address.trim()) newErrors.address = 'Organization address is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.state.trim()) newErrors.state = 'State/Province is required';
        if (!formData.type.trim()) newErrors.type = 'Organization type is required';
        if (!formData.taxNumber.trim()) newErrors.taxNumber = 'Tax number is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle checkbox values
        const inputValue = type === 'checkbox' ? checked : value;
        
        setFormData({
            ...formData,
            [name]: inputValue
        });
        
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

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                                {errors.general && (
                                    <div className="text-center mb-3">
                                        <small className="text-danger">{errors.general}</small>
                                    </div>
                                )}
                                <Form role="form" onSubmit={handleSubmit}>
                                    <h6 className="heading-small text-muted mb-4">Basic Business Information</h6>
                                    <Row>
                                        <Col md="12">
                                            <FormGroup>
                                                <label className="form-control-label">Organization Name*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="name"
                                                    placeholder="Enter your organization name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    invalid={!!errors.name}
                                                />
                                                <FormFeedback>{errors.name}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Country*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="country"
                                                    type="select"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    invalid={!!errors.country}
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
                                                <label className="form-control-label">State/Province*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="state"
                                                    type="select"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    invalid={!!errors.state}
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
                                        <label className="form-control-label">Organization Address*</label>
                                        <Input
                                            className="form-control-alternative"
                                            name="address"
                                            placeholder="Enter detailed address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            invalid={!!errors.address}
                                        />
                                        <FormFeedback>{errors.address}</FormFeedback>
                                    </FormGroup>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Legal Structure*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="type"
                                                    type="select"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    invalid={!!errors.type}
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
                                                <label className="form-control-label">Business Activity/Sector*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="businessActivity"
                                                    placeholder="Ex: Retail, Software, Food Service"
                                                    type="text"
                                                    value={formData.businessActivity}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Tax Number (Matricule Fiscal)*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="taxNumber"
                                                    placeholder="Enter your tax number"
                                                    type="text"
                                                    value={formData.taxNumber}
                                                    onChange={handleChange}
                                                    invalid={!!errors.taxNumber}
                                                />
                                                <FormFeedback>{errors.taxNumber}</FormFeedback>
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
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Phone Number*</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="phone"
                                                    placeholder="Enter your phone number"
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    invalid={!!errors.phone}
                                                />
                                                <FormFeedback>{errors.phone}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label className="form-control-label">Expected Number of Employees</label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="employeeCount"
                                                    type="select"
                                                    value={formData.employeeCount}
                                                    onChange={handleChange}
                                                >
                                                    <option value="1-5">1-5</option>
                                                    <option value="6-10">6-10</option>
                                                    <option value="11-20">11-20</option>
                                                    <option value="21-50">21-50</option>
                                                    <option value="50+">50+</option>
                                                </Input>
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
                                            color="primary"
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