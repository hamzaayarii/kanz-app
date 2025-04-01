import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import classnames from 'classnames';

const TVA_RATES = {
    'TVA19': 19,
    'TVA13': 13,
    'TVA7': 7,
    'Exonéré': 0
};

const SalesReceipts = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [receiptData, setReceiptData] = useState({
    paymentMode: '',
    receiptNumber: '',
    items: [],
    shippingCharges: 0,
    receiptDate: new Date().toISOString().split('T')[0],
  });

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState({
    id: '',
    name: '',
    quantity: 1,
    price: 0,
    tax: 0
  });

  const [receipts, setReceipts] = useState([]);
  const [editingReceipt, setEditingReceipt] = useState(null);

  const [taxSummary, setTaxSummary] = useState({
    TVA19: 0,
    TVA13: 0,
    TVA7: 0,
    'Exonéré': 0
  });

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  useEffect(() => {
    fetchProducts();
    fetchReceipts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.products) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        showNotification('Unexpected data format from server', 'warning');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      showNotification('Failed to load products', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/salesReceipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      showNotification('Error fetching receipts', 'danger');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateItemAmount = (quantity, rate, taxCategory) => {
    const subtotal = quantity * rate;
    const taxRate = TVA_RATES[taxCategory];
    const taxAmount = (subtotal * taxRate) / 100;
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    };
  };

  const handleItemSelect = (e) => {
    const { value } = e.target;
    const selectedProduct = products.find((product) => product._id === value);
    if (selectedProduct) {
      setSelectedItem({
        ...selectedItem,
        id: value,
        name: selectedProduct.name,
        price: selectedProduct.salesInfo.sellingPrice,
        taxCategory: selectedProduct.salesInfo.taxCategory,
        tax: selectedProduct.salesInfo.tax
      });
    }
  };

  const handleAddItem = () => {
    if (!selectedItem.id) {
      showNotification('Please select an item first', 'warning');
      return;
    }

    const selectedProduct = products.find((product) => product._id === selectedItem.id);
    if (!selectedProduct) return;

    const { subtotal, taxAmount, total } = calculateItemAmount(
      parseFloat(selectedItem.quantity),
      selectedItem.price,
      selectedItem.taxCategory
    );

    const newItem = {
      product: selectedItem.id,
      name: selectedProduct.name,
      quantity: parseFloat(selectedItem.quantity),
      rate: selectedItem.price,
      taxCategory: selectedItem.taxCategory,
      tax: selectedItem.tax,
      subtotal: subtotal,
      taxAmount: taxAmount,
      amount: total
    };

    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Update tax summary
    const newTaxSummary = { ...taxSummary };
    newTaxSummary[selectedItem.taxCategory] += taxAmount;
    setTaxSummary(newTaxSummary);

    // Reset selected item
    setSelectedItem({
      id: '',
      name: '',
      quantity: 1,
      price: 0,
      taxCategory: 'TVA19',
      tax: TVA_RATES['TVA19']
    });

    showNotification('Item added successfully');
  };

  const handleRemoveItem = (index) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    showNotification('Item removed successfully');
  };

  const calculateSubTotal = () => {
    return receiptData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    return calculateSubTotal() + parseFloat(receiptData.shippingCharges || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // More detailed validation
    const requiredFields = {
      paymentMode: 'Payment Mode',
      receiptNumber: 'Receipt Number',
      receiptDate: 'Receipt Date'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !receiptData[key])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      showNotification(`Please fill in: ${missingFields.join(', ')}`, 'warning');
      return;
    }

    if (receiptData.items.length === 0) {
      showNotification('Please add at least one item', 'warning');
      return;
    }

    const receiptToSend = {
      ...receiptData,
      subTotal: calculateSubTotal(),
      total: calculateTotal(),
      receiptDate: new Date(receiptData.receiptDate).toISOString()
    };

    try {
      const response = await axios.post('http://localhost:5000/api/salesReceipts', receiptToSend);
      showNotification('Receipt created successfully');
      setReceipts([...receipts, response.data]);
      resetForm();
      setActiveTab('1');
    } catch (error) {
      console.error('Error creating receipt:', error);
      if (error.response?.data?.error?.message) {
        showNotification(`Error: ${error.response.data.error.message}`, 'danger');
      } else {
        showNotification('Error creating receipt', 'danger');
      }
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
    setReceiptData({
      ...receipt,
      items: [...receipt.items]
    });
    setActiveTab('2');
    showNotification('Now editing receipt: ' + receipt.receiptNumber, 'info');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const receiptToUpdate = {
      ...receiptData,
      subTotal: calculateSubTotal(),
      total: calculateTotal()
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/salesReceipts/${editingReceipt._id}`,
        receiptToUpdate
      );
      showNotification('Receipt updated successfully');
      setReceipts(receipts.map(r => r._id === editingReceipt._id ? response.data : r));
      resetForm();
      setActiveTab('1');
    } catch (error) {
      console.error('Error updating receipt:', error);
      showNotification('Error updating receipt', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/salesReceipts/${id}`);
      showNotification('Receipt deleted successfully');
      setReceipts(receipts.filter(receipt => receipt._id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      showNotification('Error deleting receipt', 'danger');
    }
  };

  const resetForm = () => {
    setReceiptData({
      paymentMode: '',
      receiptNumber: '',
      items: [],
      shippingCharges: 0,
      receiptDate: new Date().toISOString().split('T')[0],
    });
    setEditingReceipt(null);
  };

  const renderTaxSummary = () => (
    <div className="mt-3">
      <h4>TVA Summary</h4>
      <Table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(taxSummary)
            .filter(([_, amount]) => amount > 0)
            .map(([category, amount]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{amount.toFixed(2)} TND</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardBody className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-3 mb-0">Loading products...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt--7" fluid>
      {/* Notification */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1050,
        minWidth: '300px',
        maxWidth: '600px',
        transition: 'opacity 0.3s ease-in-out',
        opacity: notification.show ? 1 : 0,
        pointerEvents: notification.show ? 'all' : 'none'
      }}>
        {notification.show && (
          <Alert
            color={notification.type}
            toggle={() => setNotification(prev => ({ ...prev, show: false }))}
            fade={true}
          >
            {notification.message}
          </Alert>
        )}
      </div>

      <Row>
        <Col>
          <Card className="shadow">
            <CardHeader className="border-0">
              <Row className="align-items-center">
                <Col>
                  <h3 className="mb-0">Sales Receipts</h3>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '1' })}
                    onClick={() => setActiveTab('1')}
                    style={{ cursor: 'pointer' }}
                  >
                    Receipts List
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '2' })}
                    onClick={() => { resetForm(); setActiveTab('2'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {editingReceipt ? 'Edit Receipt' : 'Create Receipt'}
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="pt-4">
                <TabPane tabId="1">
                  <div className="table-responsive">
                    <Table className="align-items-center table-flush" hover>
                      <thead className="thead-light">
                        <tr>
                          <th>Receipt Number</th>
                          <th>Date</th>
                          <th>Payment Mode</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receipts.map((receipt) => (
                          <tr key={receipt._id}>
                            <td>{receipt.receiptNumber}</td>
                            <td>{new Date(receipt.receiptDate).toLocaleDateString()}</td>
                            <td>
                              <Badge color="primary">{receipt.paymentMode}</Badge>
                            </td>
                            <td>{receipt.total.toFixed(2)} TND</td>
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEdit(receipt)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(receipt._id)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </TabPane>

                <TabPane tabId="2">
                  <Form onSubmit={editingReceipt ? handleUpdate : handleSubmit}>
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label>Payment Mode</Label>
                          <Input
                            type="select"
                            name="paymentMode"
                            value={receiptData.paymentMode}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Payment Mode</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Receipt Number</Label>
                          <Input
                            type="text"
                            name="receiptNumber"
                            value={receiptData.receiptNumber}
                            onChange={handleInputChange}
                            placeholder="Enter receipt number"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Receipt Date</Label>
                          <Input
                            type="date"
                            name="receiptDate"
                            value={receiptData.receiptDate}
                            onChange={handleInputChange}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Card className="bg-secondary shadow border-0 mt-4">
                      <CardHeader className="bg-transparent">
                        <h3 className="mb-0">Add Items</h3>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label>Select Item</Label>
                              <Input
                                type="select"
                                value={selectedItem.id}
                                onChange={handleItemSelect}
                              >
                                <option value="">Choose an item</option>
                                {Array.isArray(products) && products.map((product) => (
                                  <option key={product._id} value={product._id}>
                                    {product.name} - {product.salesInfo.sellingPrice} TND
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={selectedItem.quantity}
                                onChange={(e) => setSelectedItem({ ...selectedItem, quantity: e.target.value })}
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup>
                              <Label>Price</Label>
                              <Input
                                type="number"
                                value={selectedItem.price}
                                readOnly
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup>
                              <Label>Tax (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={selectedItem.tax}
                                onChange={(e) => setSelectedItem({ ...selectedItem, tax: e.target.value })}
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2" className="d-flex align-items-end">
                            <Button
                              color="primary"
                              onClick={handleAddItem}
                              className="w-100"
                            >
                              <FaPlus className="mr-2" /> Add
                            </Button>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {receiptData.items.length > 0 && (
                      <Card className="mt-4">
                        <CardHeader>
                          <h3 className="mb-0">Items List</h3>
                        </CardHeader>
                        <CardBody>
                          <Table className="align-items-center" responsive>
                            <thead className="thead-light">
                              <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Tax (%)</th>
                                <th>Amount</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {receiptData.items.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.name}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.rate} TND</td>
                                  <td>{item.tax}%</td>
                                  <td>{item.amount.toFixed(2)} TND</td>
                                  <td>
                                    <Button
                                      color="danger"
                                      size="sm"
                                      onClick={() => handleRemoveItem(index)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    )}

                    {receiptData.items.length > 0 && renderTaxSummary()}

                    <Card className="mt-4">
                      <CardBody>
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label>Shipping Charges</Label>
                              <Input
                                type="number"
                                name="shippingCharges"
                                value={receiptData.shippingCharges}
                                onChange={handleInputChange}
                                min="0"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label>Sub Total</Label>
                              <Input
                                type="number"
                                value={calculateSubTotal()}
                                readOnly
                              />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label>Total</Label>
                              <Input
                                type="number"
                                value={calculateTotal()}
                                readOnly
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    <div className="text-center mt-4">
                      <Button color="secondary" onClick={() => { resetForm(); setActiveTab('1'); }} className="mr-2">
                        Cancel
                      </Button>
                      <Button color="primary" type="submit">
                        {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
                      </Button>
                    </div>
                  </Form>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SalesReceipts;
