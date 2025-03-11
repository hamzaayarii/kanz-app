import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/SalesReceipts.css';

const SalesReceipts = () => {
  // State for storing receipt data
  const [receiptData, setReceiptData] = useState({
    paymentMode: '',
    receiptNumber: '',
    customerName: '',
    items: [],
    shippingCharges: 0,
    receiptDate: new Date().toISOString().split('T')[0], // Sets the default date to today
  });

  const [products, setProducts] = useState([]); // To store fetched products
  const [selectedItem, setSelectedItem] = useState({
    id: '',
    name: '',
    quantity: 1,
    price: 0,
    tax: 0 // Add tax to the selectedItem state
  });

  const [receipts, setReceipts] = useState([]); // To store fetched receipts
  const [editingReceipt, setEditingReceipt] = useState(null); // To store the receipt being edited

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products'); // Adjust endpoint if needed
        setProducts(response.data); // Set the fetched products to state
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Error fetching products');
      }
    };

    fetchProducts();
  }, []);

  // Fetch all receipts when the component mounts
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/salesReceipts'); // Adjust endpoint if needed
        setReceipts(response.data); // Set the fetched receipts to state
      } catch (error) {
        console.error('Error fetching receipts:', error);
        alert('Error fetching receipts');
      }
    };

    fetchReceipts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptData({
      ...receiptData,
      [name]: value
    });
  };

  const handleItemSelect = (e) => {
    const { value } = e.target;
    const selectedProduct = products.find((product) => product._id === value); // Use the product ID
    setSelectedItem({
      ...selectedItem,
      id: value,
      name: selectedProduct.name,
      price: selectedProduct.salesInfo.sellingPrice
    });
  };

  const handleAddItem = () => {
    const selectedProduct = products.find((product) => product._id === selectedItem.id); // Get the full product details

    const newItem = {
      product: selectedItem.id, // Reference to the product's ID
      name: selectedProduct ? selectedProduct.name : "", // Include the item name
      quantity: selectedItem.quantity,
      rate: selectedItem.price,
      tax: selectedItem.tax, // Include the tax
      amount: selectedItem.quantity * selectedItem.price * (1 + selectedItem.tax / 100) // Apply tax to the total amount
    };

    setReceiptData({
      ...receiptData,
      items: [...receiptData.items, newItem]
    });

    setSelectedItem({
      id: '',
      name: '',
      quantity: 1,
      price: 0,
      tax: 0 // Reset tax after adding the item
    });
  };

  // Calculate the subtotal (sum of all item amounts)
  const calculateSubTotal = () => {
    return receiptData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  // Calculate the total (subtotal + shipping charges)
  const calculateTotal = () => {
    return calculateSubTotal() + parseFloat(receiptData.shippingCharges || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!receiptData.paymentMode || !receiptData.receiptNumber || !receiptData.customerName) {
      alert('Please fill in all required fields');
      return;
    }

    // Build the object to send
    const receiptToSend = {
      ...receiptData,
      subTotal: calculateSubTotal(),
      total: calculateTotal(),
      receiptDate: receiptData.receiptDate, // Ensure the date stays as string in YYYY-MM-DD format
      items: receiptData.items.map(item => ({
        ...item,
        tax: item.tax || 0 // Ensure tax is present
      }))
    };

    // Check if paymentMode is valid
    const validPaymentModes = ['Cash', 'Card', 'Bank Transfer'];
    if (!validPaymentModes.includes(receiptToSend.paymentMode)) {
      alert('Invalid payment mode');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/salesReceipts', receiptToSend);
      alert('Receipt Created Successfully');
      setReceipts([...receipts, response.data]); // Add the new receipt to the list
      console.log(response.data);
    } catch (error) {
      console.error('Error creating receipt', error);
      alert('Error creating receipt');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/salesReceipts/${id}`);
      alert('Receipt Deleted Successfully');
      setReceipts(receipts.filter(receipt => receipt._id !== id)); // Remove deleted receipt from the list
    } catch (error) {
      console.error('Error deleting receipt', error);
      alert('Error deleting receipt');
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt); // Set the receipt to edit
    setReceiptData({
      ...receipt,
      items: [...receipt.items] // Make sure to preserve items in the edit form
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Update the receipt on the backend
    const receiptToUpdate = {
      ...receiptData,
      subTotal: calculateSubTotal(),
      total: calculateTotal(),
      items: receiptData.items.map(item => ({
        ...item,
        tax: item.tax || 0 // Ensure tax is present
      }))
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/salesReceipts/${editingReceipt._id}`, receiptToUpdate);
      alert('Receipt Updated Successfully');
      setReceipts(receipts.map(receipt => (receipt._id === editingReceipt._id ? response.data : receipt)));
      setEditingReceipt(null); // Reset editing state
      setReceiptData({
        paymentMode: '',
        receiptNumber: '',
        customerName: '',
        items: [],
        shippingCharges: 0,
        receiptDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error updating receipt', error);
      alert('Error updating receipt');
    }
  };

  return (
    <div className="sales-receipt-container">
      <h2 className="header">{editingReceipt ? 'Edit Sales Receipt' : 'Create Sales Receipt'}</h2>
      <form className="receipt-form" onSubmit={editingReceipt ? handleUpdate : handleSubmit}>
        <div className="form-group">
          <label>Payment Mode</label>
          <select
            name="paymentMode"
            className="input-field"
            onChange={handleInputChange}
            required
            value={receiptData.paymentMode}
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label>Receipt Number</label>
          <input
            type="text"
            name="receiptNumber"
            className="input-field"
            onChange={handleInputChange}
            required
            value={receiptData.receiptNumber}
          />
        </div>

        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            className="input-field"
            onChange={handleInputChange}
            required
            value={receiptData.customerName}
          />
        </div>

        <div className="form-group">
          <label>Receipt Date</label>
          <input
            type="date"
            name="receiptDate"
            className="input-field"
            value={receiptData.receiptDate}
            onChange={(e) => setReceiptData({ ...receiptData, receiptDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Items</label>
          <div className="item-inputs">
            <select
              className="input-field item-field"
              value={selectedItem.id}
              onChange={handleItemSelect}
            >
              <option value="">Select Item</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.salesInfo.sellingPrice} TND
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedItem.quantity}
              onChange={(e) => setSelectedItem({ ...selectedItem, quantity: e.target.value })}
              className="input-field item-field"
              placeholder="Quantity"
            />
            <input
              type="number"
              value={selectedItem.price}
              readOnly
              className="input-field item-field"
              placeholder="Price"
            />
            <input
              type="number"
              value={selectedItem.tax}
              onChange={(e) => setSelectedItem({ ...selectedItem, tax: e.target.value })}
              className="input-field item-field"
              placeholder="Tax (%)"
            />
            <button type="button" className="add-item-button" onClick={handleAddItem}>Add Item</button>
          </div>
        </div>

        <div className="items-list">
          <h3>Items List</h3>
          <ul>
            {receiptData.items.map((item, index) => (
              <li key={index}>
                {item.name} - {item.quantity} x {item.rate} = {item.amount.toFixed(2)} TND (Tax: {item.tax}%)
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group">
          <label>Shipping Charges</label>
          <input
            type="number"
            name="shippingCharges"
            className="input-field"
            value={receiptData.shippingCharges}
            onChange={handleInputChange}
            placeholder="Shipping Charges"
          />
        </div>

        <div className="form-group">
          <label>Sub Total</label>
          <input
            type="number"
            value={calculateSubTotal()}
            readOnly
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Total</label>
          <input
            type="number"
            value={calculateTotal()}
            readOnly
            className="input-field"
          />
        </div>

        <button type="submit" className="submit-button">{editingReceipt ? 'Update Receipt' : 'Create Receipt'}</button>
      </form>

      <h3>Existing Receipts</h3>
      <ul>
  {receipts.map((receipt) => (
    <li key={receipt._id}>
      {receipt.receiptNumber} - {receipt.customerName} - {receipt.total} TND
      <button 
        className="edit-button" 
        onClick={() => handleEdit(receipt)}
      >
        Edit
      </button>
      <button 
        className="delete-button" 
        onClick={() => handleDelete(receipt._id)}
      >
        Delete
      </button>
    </li>
  ))}
</ul>

    </div>
  );
};

export default SalesReceipts;
