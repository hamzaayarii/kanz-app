import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Alert,
    Table,
    Card,
    CardHeader,
    CardBody,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Spinner,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Pagination,
    PaginationItem,
    PaginationLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaSort } from 'react-icons/fa';

const TVA_RATES = {
    'TVA19': 19,
    'TVA13': 13,
    'TVA7': 7,
    'Exonéré': 0
};

const Items = () => {
    const [item, setItem] = useState({
        type: 'Goods',
        name: '',
        unit: '',
        salesInfo: { 
            sellingPrice: '', 
            description: '', 
            taxCategory: 'TVA19',
            tax: TVA_RATES['TVA19']
        },
        purchaseInfo: { 
            costPrice: '', 
            description: '', 
            taxCategory: 'TVA19',
            tax: TVA_RATES['TVA19']
        }
    });
    const [message, setMessage] = useState({ text: '', type: 'info', show: false });
    const [itemsList, setItemsList] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [deleteModal, setDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchItems();
    }, [page, limit, searchTerm, sortField, sortDirection, filterType]);

    useEffect(() => {
        let timeoutId;
        if (message.show) {
            timeoutId = setTimeout(() => {
                setMessage(prev => ({ ...prev, show: false }));
            }, 5000); // 5 seconds
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [message.show]);

    const showNotification = (text, type = 'info') => {
        setMessage({ text, type, show: true });
    };

        const fetchItems = async () => {
            try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:5000/api/products`, {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    sortField,
                    sortDirection,
                    filterType
                }
            });
            console.log('API Response:', response.data);
            
            if (Array.isArray(response.data)) {
                setItemsList(response.data);
                setTotalPages(Math.ceil(response.data.length / limit));
            } else if (response.data.products) {
                setItemsList(response.data.products);
                setTotalPages(response.data.totalPages || Math.ceil(response.data.products.length / limit));
            } else {
                console.error('Unexpected API response format:', response.data);
                setItemsList([]);
                setTotalPages(1);
                showNotification('Failed to load items properly', 'danger');
            }
            } catch (error) {
                console.error('Error fetching items:', error);
            showNotification('Failed to fetch items: ' + error.message, 'danger');
            setItemsList([]);
        } finally {
            setIsLoading(false);
            }
        };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setItem(prevState => ({
                ...prevState,
                [keys[0]]: {
                    ...prevState[keys[0]],
                    [keys[1]]: value
                }
            }));
        } else {
            setItem(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleTaxCategoryChange = (e, type) => {
        const { value } = e.target;
        const newTax = TVA_RATES[value];
        
        setItem(prevState => ({
            ...prevState,
            [type]: {
                ...prevState[type],
                taxCategory: value,
                tax: newTax
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            // Validate required fields
            if (!item.name || !item.unit) {
                showNotification('Name and Unit are required fields', 'warning');
                return;
            }

            // Validate prices
            if (!item.salesInfo.sellingPrice || !item.purchaseInfo.costPrice) {
                showNotification('Selling price and Cost price are required', 'warning');
                return;
            }

            // Format the data
            const productData = {
                type: item.type,
                name: item.name.trim(),
                unit: item.unit.trim(),
                salesInfo: {
                    sellingPrice: parseFloat(item.salesInfo.sellingPrice),
                    description: item.salesInfo.description?.trim() || '',
                    taxCategory: item.salesInfo.taxCategory || 'TVA19',
                    tax: TVA_RATES[item.salesInfo.taxCategory || 'TVA19']
                },
                purchaseInfo: {
                    costPrice: parseFloat(item.purchaseInfo.costPrice),
                    description: item.purchaseInfo.description?.trim() || '',
                    taxCategory: item.purchaseInfo.taxCategory || 'TVA19',
                    tax: TVA_RATES[item.purchaseInfo.taxCategory || 'TVA19']
                }
            };

            console.log('Sending product data:', productData);

            if (isEditMode) {
                const response = await axios.put(`http://localhost:5000/api/products/${currentItemId}`, productData);
                console.log('Server response:', response.data);
                showNotification('Item updated successfully!', 'success');
            } else {
                const response = await axios.post('http://localhost:5000/api/products', productData);
                console.log('Server response:', response.data);
                showNotification('Item added successfully!', 'success');
            }
            resetForm();
            fetchItems();
        } catch (error) {
            console.error('Error submitting product:', error.response?.data || error);
            if (error.response?.data?.details) {
                const errorDetails = error.response.data.details.join('\n');
                showNotification(`Validation Errors:\n${errorDetails}`, 'danger');
            } else {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
                showNotification(`Failed to ${isEditMode ? 'update' : 'add'} item: ${errorMessage}`, 'danger');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
            setItem({
                type: 'Goods',
                name: '',
                unit: '',
                salesInfo: { sellingPrice: '', description: '', tax: TVA_RATES['TVA19'] },
                purchaseInfo: { costPrice: '', description: '', tax: TVA_RATES['TVA19'] }
            });
        setIsEditMode(false);
        setCurrentItemId(null);
    };

    const handleEdit = (itemId) => {
        const selectedItem = itemsList.find(i => i._id === itemId);
        setItem(selectedItem);
        setIsEditMode(true);
        setCurrentItemId(itemId);
        setActiveTab('2');
        showNotification('Now editing item: ' + selectedItem.name, 'info');
    };

    const handleDelete = async (itemId) => {
        setItemToDelete(itemId);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`http://localhost:5000/api/products/${itemToDelete}`);
            showNotification('Item deleted successfully!', 'success');
            setDeleteModal(false);
            fetchItems();
        } catch (error) {
            showNotification('Failed to delete item: ' + error.message, 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (field) => {
        if (sortField === field) {
            return <FaSort className={sortDirection === 'asc' ? 'text-primary' : 'text-danger'} />;
        }
        return null;
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1050,
                minWidth: '300px',
                maxWidth: '600px',
                transition: 'opacity 0.3s ease-in-out',
                opacity: message.show ? 1 : 0,
                pointerEvents: message.show ? 'all' : 'none'
            }}>
                {message.show && (
                    <Alert
                        color={message.type}
                        toggle={() => setMessage(prev => ({ ...prev, show: false }))}
                        fade={true}
                    >
                        {message.text}
                    </Alert>
                )}
            </div>

            <div className="container-fluid mt-3">
                <div className="page-header">
                    <div className="header-content">
                        <h2 className="mb-0">Items Management</h2>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb bg-transparent p-0">
                                <li className="breadcrumb-item">
                                    <a href="#/admin" className="text-primary">Dashboard</a>
                                </li>
                                <li className="breadcrumb-item active text-muted">Items</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <style>
                    {`
                    .page-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1.5rem;
                        position: relative;
                        z-index: 1;
                    }
                    .header-content {
                        flex: 1;
                    }
                    .breadcrumb {
                        margin-bottom: 0;
                    }
                    .edit-mode {
                        background-color: #f8f9fe !important;
                        border-color: #5e72e4 !important;
                        color: #5e72e4 !important;
                        font-weight: 600 !important;
                    }
                    .edit-tab {
                        display: flex;
                        align-items: center;
                        color: inherit;
                    }
                    .edit-mode-form {
                        animation: highlight 1s ease-in-out;
                        border-left: 4px solid #5e72e4;
                        padding-left: 1rem;
                    }
                    @keyframes highlight {
                        0% { background-color: rgba(94, 114, 228, 0.1); }
                        100% { background-color: transparent; }
                    }
                    .nav-tabs .nav-link.active.edit-mode {
                        border-color: #5e72e4 #5e72e4 #fff !important;
                    }
                    `}
                </style>

                <Card className="shadow">
                    <CardBody>
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={activeTab === '1' ? 'active' : ''}
                                    onClick={() => setActiveTab('1')}
                                >
                                    Items List
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={`${activeTab === '2' ? 'active' : ''} ${isEditMode ? 'edit-mode' : ''}`}
                                    onClick={() => setActiveTab('2')}
                                >
                                    {isEditMode ? (
                                        <span className="edit-tab">
                                            <FaEdit className="mr-1" /> Edit Item
                                        </span>
                                    ) : (
                                        'Add New Item'
                                    )}
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="1">
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <FaSearch />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Search items..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <Input
                                            type="select"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="Goods">Goods</option>
                                            <option value="Service">Service</option>
                                        </Input>
                                    </Col>
                                    <Col md={3}>
                                        <Input
                                            type="select"
                                            value={limit}
                                            onChange={(e) => setLimit(Number(e.target.value))}
                                        >
                                            <option value={5}>5 per page</option>
                                            <option value={10}>10 per page</option>
                                            <option value={20}>20 per page</option>
                                        </Input>
                                    </Col>
                                </Row>

                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead>
                                            <tr>
                                                <th onClick={() => toggleSort('type')} style={{ cursor: 'pointer' }}>
                                                    Type {renderSortIcon('type')}
                                                </th>
                                                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                                                    Name {renderSortIcon('name')}
                                                </th>
                                                <th onClick={() => toggleSort('unit')} style={{ cursor: 'pointer' }}>
                                                    Unit {renderSortIcon('unit')}
                                                </th>
                                                <th onClick={() => toggleSort('salesInfo.sellingPrice')} style={{ cursor: 'pointer' }}>
                                                    Sales Price {renderSortIcon('salesInfo.sellingPrice')}
                                                </th>
                                                <th onClick={() => toggleSort('purchaseInfo.costPrice')} style={{ cursor: 'pointer' }}>
                                                    Cost Price {renderSortIcon('purchaseInfo.costPrice')}
                                                </th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        <Spinner color="primary" />
                                                    </td>
                                                </tr>
                                            ) : !itemsList || itemsList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        No items found
                                                    </td>
                                                </tr>
                                            ) : (
                                                itemsList.map((item) => (
                                                    <tr key={item._id}>
                                                        <td>
                                                            <Badge color={item.type === 'Goods' ? 'success' : 'info'}>
                                                                {item.type}
                                                            </Badge>
                                                        </td>
                                                        <td>{item.name}</td>
                                                        <td>{item.unit}</td>
                                                        <td>{item.salesInfo.sellingPrice} TND</td>
                                                        <td>{item.purchaseInfo.costPrice} TND</td>
                                                        <td>
                                                            <Button
                                                                color="warning"
                                                                size="sm"
                                                                className="mr-2"
                                                                onClick={() => handleEdit(item._id)}
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => handleDelete(item._id)}
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                <Pagination className="justify-content-center mt-4">
                                    <PaginationItem disabled={page === 1}>
                                        <PaginationLink previous onClick={() => setPage(page - 1)} />
                                    </PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i + 1} active={page === i + 1}>
                                            <PaginationLink onClick={() => setPage(i + 1)}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem disabled={page === totalPages}>
                                        <PaginationLink next onClick={() => setPage(page + 1)} />
                                    </PaginationItem>
                                </Pagination>
                            </TabPane>

                            <TabPane tabId="2">
                                <div className={`form-container ${isEditMode ? 'edit-mode-form' : ''}`}>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Type</Label>
                                                    <Input type="select" name="type" value={item.type} onChange={handleChange}>
                                                        <option value="Goods">Goods</option>
                                                        <option value="Service">Service</option>
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Name</Label>
                                                    <Input type="text" name="name" value={item.name} onChange={handleChange} required />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Unit</Label>
                                                    <Input type="text" name="unit" value={item.unit} onChange={handleChange} required />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <h4 className="mt-4">Sales Information</h4>
                                        <Row>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Selling Price</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText>TND</InputGroupText>
                                                        </InputGroupAddon>
                                                        <Input
                                                            type="number"
                                                            name="salesInfo.sellingPrice"
                                                            value={item.salesInfo.sellingPrice}
                                                            onChange={handleChange}
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Tax Category</Label>
                                                    <Input
                                                        type="select"
                                                        name="salesInfo.taxCategory"
                                                        value={item.salesInfo.taxCategory}
                                                        onChange={(e) => handleTaxCategoryChange(e, 'salesInfo')}
                                                    >
                                                        {Object.keys(TVA_RATES).map(category => (
                                                            <option key={category} value={category}>
                                                                {category} ({TVA_RATES[category]}%)
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <FormGroup>
                                            <Label>Sales Description</Label>
                                            <Input
                                                type="textarea"
                                                name="salesInfo.description"
                                                value={item.salesInfo.description}
                                                onChange={handleChange}
                                                rows="2"
                                            />
                                        </FormGroup>

                                        <h4 className="mt-4">Purchase Information</h4>
                                        <Row>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Cost Price</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText>TND</InputGroupText>
                                                        </InputGroupAddon>
                                                        <Input
                                                            type="number"
                                                            name="purchaseInfo.costPrice"
                                                            value={item.purchaseInfo.costPrice}
                                                            onChange={handleChange}
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Tax Category</Label>
                                                    <Input
                                                        type="select"
                                                        name="purchaseInfo.taxCategory"
                                                        value={item.purchaseInfo.taxCategory}
                                                        onChange={(e) => handleTaxCategoryChange(e, 'purchaseInfo')}
                                                    >
                                                        {Object.keys(TVA_RATES).map(category => (
                                                            <option key={category} value={category}>
                                                                {category} ({TVA_RATES[category]}%)
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <FormGroup>
                                            <Label>Purchase Description</Label>
                                            <Input
                                                type="textarea"
                                                name="purchaseInfo.description"
                                                value={item.purchaseInfo.description}
                                                onChange={handleChange}
                                                rows="2"
                                            />
                                        </FormGroup>

                                        <div className="mt-4">
                                            <Button color="primary" type="submit" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <Spinner size="sm" className="mr-2" />
                                                        {isEditMode ? 'Updating...' : 'Adding...'}
                                                    </>
                                                ) : (
                                                    isEditMode ? 'Update Item' : 'Add Item'
                                                )}
                                            </Button>
                                            <Button color="secondary" className="ml-2" onClick={resetForm}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </TabPane>
                        </TabContent>
                    </CardBody>
                </Card>

                <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
                    <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
                        Confirm Delete
                    </ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button color="danger" onClick={confirmDelete} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </ModalFooter>
                </Modal>
        </div>
        </>
    );
};

export default Items;
