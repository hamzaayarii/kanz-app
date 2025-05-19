import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    Table,
    Button,
    Badge,
    UncontrolledTooltip,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Progress,
    CardFooter
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Header from 'components/Headers/Header';
import { 
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiBriefcase, FiPhone, 
    FiMapPin, FiDollarSign, FiBarChart2, FiTrendingUp, FiTrendingDown,
    FiFilter, FiGrid, FiList, FiChevronRight, FiAlertCircle, FiEye
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const BusinessManagement = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [activeFilter, setActiveFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserBusinesses();
    }, []);

    const fetchUserBusinesses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                navigate('/auth/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/business/user-businesses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setBusinesses(data.businesses || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load businesses');
            }
        } catch (err) {
            console.error('Error fetching businesses:', err);
            setError('Error connecting to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBusiness = () => {
        navigate('/standalone/business-registration');
    };

    const handleEditBusiness = (businessId) => {
        navigate(`/admin/business-update/${businessId}`);
    };

    const toggleDeleteModal = (business = null) => {
        setBusinessToDelete(business);
        setDeleteModal(!deleteModal);
    };

    const handleDeleteBusiness = async () => {
        if (!businessToDelete) return;
    
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/business/${businessToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const errorData = await response.text();
                try {
                    const jsonData = JSON.parse(errorData);
                    throw new Error(jsonData.message || 'Failed to delete business');
                } catch {
                    throw new Error(errorData || 'Failed to delete business');
                }
            }
    
            const data = await response.json();
            setBusinesses(businesses.filter(b => b._id !== businessToDelete._id));
            setError(null);
            toggleDeleteModal();
        } catch (err) {
            console.error('Error deleting business:', err);
            setError(err.message || 'Error connecting to server. Please try again.');
        }
    };

    const handleViewBusiness = (businessId) => {
        // This would be implemented to view business details
        console.log("View business details:", businessId);
    };

    const filterBusinesses = (businesses) => {
        let filtered = businesses;
        
        // Apply search filter
        filtered = filtered.filter(business => 
            business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Apply type filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(business => 
                business.type.toLowerCase() === activeFilter.toLowerCase()
            );
        }
        
        return filtered;
    };

    const filteredBusinesses = filterBusinesses(businesses);

    const getBusinessTypeColor = (type) => {
        const colors = {
            'retail': 'info',
            'service': 'success',
            'manufacturing': 'warning',
            'wholesale': 'primary',
            'other': 'secondary'
        };
        return colors[type.toLowerCase()] || 'primary';
    };

    const getBusinessTypeIcon = (type) => {
        const icons = {
            'retail': <FiDollarSign />,
            'service': <FiTrendingUp />,
            'manufacturing': <FiBarChart2 />,
            'wholesale': <FiBriefcase />,
            'other': <FiBriefcase />
        };
        return icons[type.toLowerCase()] || <FiBriefcase />;
    };

    const businessTypes = ['all', 'retail', 'service', 'manufacturing', 'wholesale', 'other'];

    const getBusinessAnalytics = () => {
        const counts = {
            total: businesses.length,
            retail: businesses.filter(b => b.type.toLowerCase() === 'retail').length,
            service: businesses.filter(b => b.type.toLowerCase() === 'service').length,
            manufacturing: businesses.filter(b => b.type.toLowerCase() === 'manufacturing').length,
            wholesale: businesses.filter(b => b.type.toLowerCase() === 'wholesale').length,
            other: businesses.filter(b => 
                !['retail', 'service', 'manufacturing', 'wholesale'].includes(b.type.toLowerCase())
            ).length
        };
        
        return counts;
    };
    
    const analytics = getBusinessAnalytics();

    const renderBusinessCards = () => {
        if (viewMode === 'grid') {
            return (
                <Row>
                    {filteredBusinesses.map((business) => (
                        <Col lg="4" md="6" className="mb-4" key={business._id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="shadow-sm h-100 business-card">
                                    <CardHeader className="bg-transparent border-0 pt-4 pb-0">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <Badge 
                                                color={getBusinessTypeColor(business.type)}
                                                className="badge-pill px-3 py-2 text-white"
                                            >
                                                {getBusinessTypeIcon(business.type)} {business.type}
                                            </Badge>
                                            <div>
                                                <Button
                                                    color="link"
                                                    size="sm"
                                                    className="mr-0 btn-icon p-0 text-primary"
                                                    id={`edit-grid-${business._id}`}
                                                    onClick={() => handleEditBusiness(business._id)}
                                                >
                                                    <FiEdit2 />
                                                </Button>
                                                <UncontrolledTooltip
                                                    delay={0}
                                                    target={`edit-grid-${business._id}`}
                                                >
                                                    Edit Business
                                                </UncontrolledTooltip>
                                                <Button
                                                    color="link"
                                                    size="sm"
                                                    className="ml-2 btn-icon p-0 text-danger"
                                                    id={`delete-grid-${business._id}`}
                                                    onClick={() => toggleDeleteModal(business)}
                                                >
                                                    <FiTrash2 />
                                                </Button>
                                                <UncontrolledTooltip
                                                    delay={0}
                                                    target={`delete-grid-${business._id}`}
                                                >
                                                    Delete Business
                                                </UncontrolledTooltip>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="pt-3">
                                        <h5 className="font-weight-bold mb-3">{business.name}</h5>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className={`icon-shape bg-${getBusinessTypeColor(business.type)}-soft rounded p-2 mr-3`}>
                                                {getBusinessTypeIcon(business.type)}
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Tax ID</small>
                                                <span className="font-weight-bold">{business.taxNumber}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-flex align-items-center mb-2">
                                                <FiMapPin className="mr-2" size={14} />
                                                <span className="text-truncate">{business.address}</span>
                                            </small>
                                            <small className="text-muted d-flex align-items-center">
                                                <FiPhone className="mr-2" size={14} />
                                                {business.phone || "Not provided"}
                                            </small>
                                        </div>
                                    </CardBody>
                                    <CardFooter className="bg-transparent border-0 pt-0">
                                        <Button
                                            color="primary"
                                            outline
                                            block
                                            className="mt-2"
                                            onClick={() => handleViewBusiness(business._id)}
                                        >
                                            View Details <FiChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            );
        } else {
            return (
                <div className="table-responsive">
                    <Table hover className="align-items-center">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col" className="border-0">Business</th>
                                <th scope="col" className="border-0">Type</th>
                                <th scope="col" className="border-0">Details</th>
                                <th scope="col" className="border-0">Status</th>
                                <th scope="col" className="border-0 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBusinesses.map((business, index) => (
                                <motion.tr 
                                    key={business._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="business-row"
                                >
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className={`icon-shape bg-${getBusinessTypeColor(business.type)}-soft rounded p-3 mr-3`}>
                                                {getBusinessTypeIcon(business.type)}
                                            </div>
                                            <div>
                                                <h6 className="mb-0">{business.name}</h6>
                                                <small className="text-muted">Tax ID: {business.taxNumber}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge 
                                            color={getBusinessTypeColor(business.type)}
                                            className="badge-pill"
                                        >
                                            {business.type}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <small className="d-flex align-items-center mb-1">
                                                <FiMapPin className="mr-2" />
                                                <span className="text-truncate" style={{maxWidth: "200px"}}>{business.address}</span>
                                            </small>
                                            <small className="d-flex align-items-center">
                                                <FiPhone className="mr-2" />
                                                {business.phone || "Not provided"}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge color="success" className="badge-pill">
                                            Active
                                        </Badge>
                                    </td>
                                    <td className="text-right">
                                        <Button
                                            color="primary"
                                            size="sm"
                                            className="mr-2 btn-icon"
                                            id={`view-${business._id}`}
                                            onClick={() => handleViewBusiness(business._id)}
                                        >
                                            <FiEye />
                                        </Button>
                                        <UncontrolledTooltip
                                            delay={0}
                                            target={`view-${business._id}`}
                                        >
                                            View Details
                                        </UncontrolledTooltip>
                                        <Button
                                            color="info"
                                            size="sm"
                                            className="mr-2 btn-icon"
                                            id={`edit-${business._id}`}
                                            onClick={() => handleEditBusiness(business._id)}
                                        >
                                            <FiEdit2 />
                                        </Button>
                                        <UncontrolledTooltip
                                            delay={0}
                                            target={`edit-${business._id}`}
                                        >
                                            Edit Business
                                        </UncontrolledTooltip>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="btn-icon"
                                            id={`delete-${business._id}`}
                                            onClick={() => toggleDeleteModal(business)}
                                        >
                                            <FiTrash2 />
                                        </Button>
                                        <UncontrolledTooltip
                                            delay={0}
                                            target={`delete-${business._id}`}
                                        >
                                            Delete Business
                                        </UncontrolledTooltip>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            );
        }
    };

    return (
        <>
            <div className="header bg-gradient-teal pb-8 pt-5 pt-md-8">
                <Container fluid>
                    <div className="header-body">
                        <Row className="mb-3">
                            <Col>
                                <h1 className="display-4 text-white">Business Portfolio</h1>
                                <p className="text-white opacity-8">Manage all your business entities in one place</p>
                            </Col>
                        </Row>
                        
                        {/* Analytics Cards */}
                        <Row>
                            <Col xl="3" md="6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="card-stats mb-4 mb-xl-0">
                                        <CardBody>
                                            <Row>
                                                <div className="col">
                                                    <CardHeader className="bg-transparent border-0 p-0">
                                                        <h5 className="text-uppercase text-muted mb-0">Total Businesses</h5>
                                                    </CardHeader>
                                                    <span className="h2 font-weight-bold mb-0">{analytics.total}</span>
                                                </div>
                                                <Col className="col-auto">
                                                    <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                                                        <FiBriefcase />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <p className="mt-3 mb-0 text-muted text-sm">
                                                <span className="text-success mr-2">
                                                    <FiTrendingUp className="mr-1" />
                                                    {analytics.total > 0 ? "Active" : "No businesses"}
                                                </span>
                                            </p>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            </Col>
                            <Col xl="3" md="6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <Card className="card-stats mb-4 mb-xl-0">
                                        <CardBody>
                                            <Row>
                                                <div className="col">
                                                    <CardHeader className="bg-transparent border-0 p-0">
                                                        <h5 className="text-uppercase text-muted mb-0">Retail</h5>
                                                    </CardHeader>
                                                    <span className="h2 font-weight-bold mb-0">{analytics.retail}</span>
                                                </div>
                                                <Col className="col-auto">
                                                    <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                                                        <FiDollarSign />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Progress
                                                className="progress-xs mt-3"
                                                max="100"
                                                value={analytics.total > 0 ? (analytics.retail / analytics.total) * 100 : 0}
                                                color="info"
                                            />
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            </Col>
                            <Col xl="3" md="6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <Card className="card-stats mb-4 mb-xl-0">
                                        <CardBody>
                                            <Row>
                                                <div className="col">
                                                    <CardHeader className="bg-transparent border-0 p-0">
                                                        <h5 className="text-uppercase text-muted mb-0">Service</h5>
                                                    </CardHeader>
                                                    <span className="h2 font-weight-bold mb-0">{analytics.service}</span>
                                                </div>
                                                <Col className="col-auto">
                                                    <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                                                        <FiTrendingUp />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Progress
                                                className="progress-xs mt-3"
                                                max="100"
                                                value={analytics.total > 0 ? (analytics.service / analytics.total) * 100 : 0}
                                                color="success"
                                            />
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            </Col>
                            <Col xl="3" md="6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <Card className="card-stats mb-4 mb-xl-0">
                                        <CardBody>
                                            <Row>
                                                <div className="col">
                                                    <CardHeader className="bg-transparent border-0 p-0">
                                                        <h5 className="text-uppercase text-muted mb-0">Manufacturing</h5>
                                                    </CardHeader>
                                                    <span className="h2 font-weight-bold mb-0">{analytics.manufacturing}</span>
                                                </div>
                                                <Col className="col-auto">
                                                    <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                                        <FiBarChart2 />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Progress
                                                className="progress-xs mt-3"
                                                max="100"
                                                value={analytics.total > 0 ? (analytics.manufacturing / analytics.total) * 100 : 0}
                                                color="warning"
                                            />
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
            
            <Container className="mt--7" fluid>
                <Row>
                    <Col>
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <Col>
                                        <h3 className="mb-0">My Businesses</h3>
                                    </Col>
                                    <Col className="text-right">
                                        <div className="d-flex align-items-center justify-content-end">
                                            {/* Search */}
                                            <InputGroup className="mr-3" style={{ width: '250px' }}>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText>
                                                        <FiSearch />
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <Input 
                                                    placeholder="Search businesses..." 
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </InputGroup>
                                            
                                            {/* View Toggle */}
                                            <div className="btn-group mr-3">
                                                <Button 
                                                    color={viewMode === 'grid' ? 'primary' : 'light'}
                                                    size="sm"
                                                    onClick={() => setViewMode('grid')}
                                                >
                                                    <FiGrid />
                                                </Button>
                                                <Button 
                                                    color={viewMode === 'list' ? 'primary' : 'light'}
                                                    size="sm"
                                                    onClick={() => setViewMode('list')}
                                                >
                                                    <FiList />
                                                </Button>
                                            </div>
                                            
                                            {/* Add Business Button */}
                                            <Button
                                                color="primary"
                                                onClick={handleAddBusiness}
                                                className="d-flex align-items-center"
                                            >
                                                <FiPlus className="mr-2" />
                                                Add Business
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                                
                                {/* Filter Pills */}
                                <div className="mt-3">
                                    <div className="d-flex align-items-center">
                                        <FiFilter className="mr-2 text-muted" />
                                        <small className="text-muted mr-3">Filter by type:</small>
                                        <div>
                                            {businessTypes.map(type => (
                                                <Button 
                                                    key={type} 
                                                    color={activeFilter === type ? "primary" : "light"} 
                                                    size="sm" 
                                                    className="mr-2 mb-2 mb-md-0 text-capitalize"
                                                    onClick={() => setActiveFilter(type)}
                                                >
                                                    {type}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardBody className="pt-0">
                                {loading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center py-5"
                                    >
                                        <div className="spinner-pulse"></div>
                                        <p className="mt-3 text-muted">Loading your business portfolio...</p>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center py-5"
                                    >
                                        <div className="error-container">
                                            <div className="error-icon">
                                                <FiAlertCircle size={48} className="text-danger" />
                                            </div>
                                            <h4 className="mt-3 text-danger">{error}</h4>
                                            <Button color="primary" onClick={fetchUserBusinesses} className="mt-3">
                                                Try Again
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : filteredBusinesses.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center py-5"
                                    >
                                        <div className="empty-state">
                                            <div className="empty-icon-container mb-4">
                                                <div className="empty-icon bg-light rounded-circle p-4 d-inline-flex">
                                                    <FiBriefcase size={40} className="text-muted" />
                                                </div>
                                            </div>
                                            <h4 className="mb-3">
                                                {searchTerm || activeFilter !== 'all' ? 
                                                    "No matching businesses found" : 
                                                    "No businesses yet"}
                                            </h4>
                                            <p className="text-muted mb-4 px-4 w-75 mx-auto">
                                                {searchTerm || activeFilter !== 'all' ? 
                                                    "Try adjusting your search or filters to find what you're looking for" : 
                                                    "Start by adding your first business to begin tracking and managing your operations"}
                                            </p>
                                            {searchTerm || activeFilter !== 'all' ? (
                                                <Button color="secondary" onClick={() => {setSearchTerm(''); setActiveFilter('all');}}>
                                                    Clear Filters
                                                </Button>
                                            ) : (
                                                <Button color="primary" onClick={handleAddBusiness}>
                                                    <FiPlus className="mr-2" />
                                                    Add Your First Business
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="pt-3">
                                        {renderBusinessCards()}
                                    </div>
                                )}
                            </CardBody>
                            
                            {filteredBusinesses.length > 0 && (
                                <CardFooter className="py-4 bg-transparent">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Showing {filteredBusinesses.length} of {businesses.length} businesses
                                        </small>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModal} toggle={() => toggleDeleteModal()} centered>
                <ModalHeader toggle={() => toggleDeleteModal()} className="border-0 pb-0">
                    <h4 className="mb-0">Confirm Deletion</h4>
                </ModalHeader>
                <ModalBody className="pt-0">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center my-4"
                    >
                        <div className="bg-danger-soft rounded-circle d-inline-flex p-4 mb-3">
                            <FiTrash2 size={32} className="text-danger" />
                        </div>
                        <h5 className="font-weight-bold">Delete {businessToDelete?.name}?</h5>
                        <p className="text-muted px-4">
                            This will permanently remove the business and all associated data. 
                            This action cannot be undone.
                        </p>
                    </motion.div>
                </ModalBody>
                <ModalFooter className="border-0 pt-0">
                    <Button color="secondary" outline onClick={() => toggleDeleteModal()}>
                        Cancel
                    </Button>
                    <Button color="danger" onClick={handleDeleteBusiness}>
                        Delete Business
                    </Button>
                </ModalFooter>
            </Modal>

            <style>
                {`
                    /* Custom Styles */
                    .icon-shape {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    /* Updated Color Palette */
                    .bg-gradient-teal {
                        background: linear-gradient(87deg, #0E6D6B 0, #1BA39C 100%) !important;
                    }
                    
                    /* Soft background colors for icons */
                    .bg-primary-soft { background-color: rgba(27, 163, 156, 0.1); color: #1BA39C; }
                    .bg-info-soft { background-color: rgba(0, 188, 212, 0.1); color: #00BCD4; }
                    .bg-success-soft { background-color: rgba(76, 175, 80, 0.1); color: #4CAF50; }
                    .bg-warning-soft { background-color: rgba(245, 124, 0, 0.1); color: #F57C00; }
                    .bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); color: #dc3545; }
                    
                    /* Updating icon colors */
                    .icon-shape.bg-primary {
                        background-color: #1BA39C !important;
                    }
                    
                    .icon-shape.bg-info {
                        background-color: #00BCD4 !important;
                    }
                    
                    .icon-shape.bg-success {
                        background-color: #4CAF50 !important;
                    }
                    
                    .icon-shape.bg-warning {
                        background-color: #F57C00 !important;
                    }
                    
                    /* Override button colors */
                    .btn-primary {
                        background-color: #1BA39C;
                        border-color: #1BA39C;
                    }
                    
                    .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
                        background-color: #148B88 !important;
                        border-color: #148B88 !important;
                    }
                    
                    .btn-outline-primary {
                        color: #1BA39C;
                        border-color: #1BA39C;
                    }
                    
                    .btn-outline-primary:hover, .btn-outline-primary:focus {
                        background-color: #1BA39C;
                        border-color: #1BA39C;
                    }
                    
                    /* Badge colors */
                    .badge-primary {
                        background-color: #1BA39C;
                    }
                    
                    .badge-info {
                        background-color: #00BCD4;
                    }
                    
                    .badge-success {
                        background-color: #4CAF50;
                    }
                    
                    .badge-warning {
                        background-color: #F57C00;
                    }
                    
                    /* Progress bar colors */
                    .progress-bar.bg-info {
                        background-color: #00BCD4 !important;
                    }
                    
                    .progress-bar.bg-success {
                        background-color: #4CAF50 !important;
                    }
                    
                    .progress-bar.bg-warning {
                        background-color: #F57C00 !important;
                    }
                    
                    /* Text colors */
                    .text-primary {
                        color: #1BA39C !important;
                    }
                    
                    .text-info {
                        color: #00BCD4 !important;
                    }
                    
                    .text-success {
                        color: #4CAF50 !important;
                    }
                    
                    .text-warning {
                        color: #F57C00 !important;
                    }
                    
                    /* Hover effects */
                    .business-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(27, 163, 156, 0.1);
                    }
                    
                    .business-row:hover {
                        background-color: rgba(27, 163, 156, 0.03);
                    }
                    
                    /* Loading spinner */
                    .spinner-pulse {
                        background-color: #1BA39C;
                        opacity: 0.7;
                        animation: pulse 1.5s infinite ease-in-out;
                    }
                    
                    @keyframes pulse {
                        0% {
                            transform: scale(0.8);
                            opacity: 0.7;
                        }
                        50% {
                            transform: scale(1.2);
                            opacity: 0.3;
                        }
                        100% {
                            transform: scale(0.8);
                            opacity: 0.7;
                        }
                    }
                    
                    .error-container {
                        padding: 30px;
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    
                    .empty-state {
                        padding: 30px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    
                    /* Main content background */
                    .card {
                        background-color: #FFFFFF;
                    }
                    
                    body {
                        background-color: #FAFAFA;
                    }
                `}
            </style>
        </>
    );
};

export default BusinessManagement;