import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input, Table } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        business: "",
        category: "",
        date: "",
        amount: "",
        tax: "",
        vendor: "",
        reference: "",
        description: "",
    });

    useEffect(() => {
        fetchBusinesses();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            fetchExpenses(selectedBusiness);
        }
    }, [selectedBusiness]);

    const fetchBusinesses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get("http://localhost:5000/api/business/buisnessowner", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBusinesses(response.data.businesses);
            if (response.data.businesses.length > 0) {
                setSelectedBusiness(response.data.businesses[0]._id);
            }
        } catch (error) {
            console.error("Error fetching businesses", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get("http://localhost:5000/api/categories", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchExpenses = async (businessId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/expenses?business=${businessId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses", error);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.category) errors.category = "Category is required";
        if (!formData.date) errors.date = "Date is required";
        if (!formData.amount || Number(formData.amount) <= 0) errors.amount = "Amount must be greater than 0";
        if (!formData.tax && formData.tax !== 0) errors.tax = "Tax is required";
        if (!formData.vendor) errors.vendor = "Vendor is required";
        if (!formData.reference) errors.reference = "Reference is required";
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (editingExpense) {
                await axios.put(`http://localhost:5000/api/expenses/${editingExpense._id}`, formData);
            } else {
                await axios.post("http://localhost:5000/api/expenses", { ...formData, business: selectedBusiness });
            }
            fetchExpenses(selectedBusiness);
            resetForm();
        } catch (error) {
            console.error("Error saving expense", error);
        }
    };

    const handleEdit = (expense) => {
        const formattedDate = new Date(expense.date).toISOString().split('T')[0];
        setFormData({ ...expense, date: formattedDate });
        setEditingExpense(expense);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await axios.delete(`http://localhost:5000/api/expenses/${id}`);
                fetchExpenses(selectedBusiness);
            } catch (error) {
                console.error("Error deleting expense", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ business: "", category: "", date: "", amount: "", tax: "", vendor: "", reference: "", description: "" });
        setEditingExpense(null);
        setFormErrors({});
        setShowForm(false);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : "Unknown Category";
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Card className="shadow p-4">
                    <h3>Manage Expenses</h3>

                    <FormGroup>
                        <Label>Select Business</Label>
                        <Input type="select" value={selectedBusiness} onChange={(e) => setSelectedBusiness(e.target.value)}>
                            {businesses.map((biz) => (
                                <option key={biz._id} value={biz._id}>{biz.name}</option>
                            ))}
                        </Input>
                    </FormGroup>

                    <Button color="primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Hide Form" : "Add Expense"}
                    </Button>

                    {showForm && (
                        <Form onSubmit={handleSubmit} className="mt-3">
                            <FormGroup>
                                <Label>Category</Label>
                                <Input
                                    type="select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    invalid={!!formErrors.category}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))}
                                </Input>
                                {formErrors.category && <div className="text-danger">{formErrors.category}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Date</Label>
                                <Input type="date" name="date" value={formData.date} onChange={handleChange} invalid={!!formErrors.date} required />
                                {formErrors.date && <div className="text-danger">{formErrors.date}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Amount</Label>
                                <Input type="number" name="amount" value={formData.amount} onChange={handleChange} invalid={!!formErrors.amount} required />
                                {formErrors.amount && <div className="text-danger">{formErrors.amount}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Tax</Label>
                                <Input type="number" name="tax" value={formData.tax} onChange={handleChange} invalid={!!formErrors.tax} required />
                                {formErrors.tax && <div className="text-danger">{formErrors.tax}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Vendor</Label>
                                <Input type="text" name="vendor" value={formData.vendor} onChange={handleChange} invalid={!!formErrors.vendor} required />
                                {formErrors.vendor && <div className="text-danger">{formErrors.vendor}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Reference</Label>
                                <Input type="text" name="reference" value={formData.reference} onChange={handleChange} invalid={!!formErrors.reference} required />
                                {formErrors.reference && <div className="text-danger">{formErrors.reference}</div>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Description</Label>
                                <Input type="text" name="description" value={formData.description} onChange={handleChange} />
                            </FormGroup>
                            <Button type="submit" color="success">{editingExpense ? "Update Expense" : "Submit"}</Button>
                            {editingExpense && <Button color="secondary" onClick={resetForm} className="ml-2">Cancel</Button>}
                        </Form>
                    )}

                    <hr />

                    <h4>Expenses List</h4>
                    <Table bordered responsive>
                        <thead>
                        <tr>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Tax</th>
                            <th>Vendor</th>
                            <th>Reference</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{getCategoryName(expense.category)}</td>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>${expense.amount}</td>
                                    <td>${expense.tax}</td>
                                    <td>{expense.vendor}</td>
                                    <td>{expense.reference}</td>
                                    <td>{expense.description}</td>
                                    <td>
                                        <Button color="warning" size="sm" onClick={() => handleEdit(expense)}>Edit</Button>
                                        <Button color="danger" size="sm" className="ml-2" onClick={() => handleDelete(expense._id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">No expenses found</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card>
            </Row>
        </Container>
    );
};

export default Expenses;



