import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input, Table } from "reactstrap";
import Header from "components/Headers/Header.js";

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [formData, setFormData] = useState({
        category: "",
        date: "",
        amount: "",
        tax: "",
        averageBill: "",
        vendor: "",
        reference: "",
    });

    // Fetch expenses from backend
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/expenses");
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses", error);
        }
    };

    // Handle form input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                // Update existing expense
                await axios.put(`http://localhost:5000/api/expenses/${editingExpense._id}`, formData);
            } else {
                // Create new expense
                await axios.post("http://localhost:5000/api/expenses", formData);
            }
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error("Error saving expense", error);
        }
    };

    // Edit an expense
    const handleEdit = (expense) => {
        setFormData(expense);
        setEditingExpense(expense);
        setShowForm(true);
    };

    // Delete an expense
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await axios.delete(`http://localhost:5000/api/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error("Error deleting expense", error);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({ category: "", date: "", amount: "", tax: "", averageBill: "", vendor: "", reference: "" });
        setEditingExpense(null);
        setShowForm(false);
    };

    return (
        <>
            <Header />
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Card className="shadow p-4">
                        <h3>Manage Expenses</h3>
                        <Button color="primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? "Hide Form" : "Add Expense"}
                        </Button>

                        {showForm && (
                            <Form onSubmit={handleSubmit} className="mt-3">
                                <FormGroup>
                                    <Label>Category</Label>
                                    <Input type="text" name="category" value={formData.category} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Date</Label>
                                    <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Amount</Label>
                                    <Input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Tax</Label>
                                    <Input type="number" name="tax" value={formData.tax} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Average Bill</Label>
                                    <Input type="number" name="averageBill" value={formData.averageBill} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Vendor</Label>
                                    <Input type="text" name="vendor" value={formData.vendor} onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Reference</Label>
                                    <Input type="text" name="reference" value={formData.reference} onChange={handleChange} required />
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
                                <th>Avg Bill</th>
                                <th>Vendor</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{expense.category}</td>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>${expense.amount}</td>
                                        <td>${expense.tax}</td>
                                        <td>${expense.averageBill}</td>
                                        <td>{expense.vendor}</td>
                                        <td>{expense.reference}</td>
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
        </>
    );
};

export default Expenses;
