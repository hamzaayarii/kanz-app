import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input, Table } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [dailyExpenses, setDailyExpenses] = useState([]);
    const [taxReportExpenses , setTaxReportExpenses] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [totalExpenses, setTotalExpenses] = useState([]);

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

    const validationRules = {
        category: { required: true, message: "Category is required" },
        date: { required: true, message: "Date is required" },
        amount: { required: true, min: 0.01, message: "Amount must be greater than 0" },
        tax: { required: true, message: "Tax is required" },
        vendor: { required: true, message: "Vendor is required" },
        reference: { required: true, message: "Reference is required" },
    };

    const validateForm = () => {
        const errors = {};
        Object.entries(validationRules).forEach(([field, rule]) => {
            const value = formData[field];
            if (rule.required && (value === "" || value === undefined || value === null)) {
                errors[field] = rule.message;
            } else if (rule.min !== undefined && parseFloat(value) < rule.min) {
                errors[field] = rule.message;
            }
        });
        return errors;
    };

    useEffect(() => {
        fetchBusinesses();
        fetchCategories();
        fetchTaxReportExpenses();
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            fetchExpenses(selectedBusiness);
            fetchDailyExpenses(selectedBusiness);
            fetchTotalExpenses(selectedBusiness);
        }
    }, [selectedBusiness]);

    const fetchBusinesses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get("http://localhost:5000/api/business/user-businesses", {
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

    const fetchTaxReportExpenses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get("http://localhost:5000/api/expenses/taxreport-expenses", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTaxReportExpenses(response.data);
        } catch (error) {
            console.error("Error fetching tax report expenses", error);
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

    const fetchDailyExpenses = async (businessId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/expenses/daily-expenses?business=${businessId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDailyExpenses(response.data);
        } catch (error) {
            console.error("Error fetching other expenses", error);
        }
    };

    const fetchTotalExpenses = async (businessId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/expenses/total-expenses?business=${businessId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTotalExpenses(response.data);
        } catch (error) {
            console.error("Error fetching other expenses", error);
        }
    };

    const generateExpenseReport = async (businessId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const res = await axios.get(`http://localhost:5000/api/expenses/generate-expense-report?businessId=${businessId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expense-report-${businessId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error fetching other expenses", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));

        const rule = validationRules[name];
        if (rule) {
            setFormErrors(prevErrors => {
                const updatedErrors = { ...prevErrors };
                if (rule.required && (value === "" || value === undefined || value === null)) {
                    updatedErrors[name] = rule.message;
                } else if (rule.min !== undefined && parseFloat(value) < rule.min) {
                    updatedErrors[name] = rule.message;
                } else {
                    delete updatedErrors[name];
                }
                return updatedErrors;
            });
        }
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
        const initialErrors = validateForm();
        setFormErrors(initialErrors);
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
                        <Input type="select" value={selectedBusiness}
                               onChange={(e) => setSelectedBusiness(e.target.value)}>
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
                            {[
                                {name: "category", label: "Category", type: "select"},
                                {name: "date", label: "Date", type: "date"},
                                {name: "amount", label: "Amount", type: "number"},
                                {name: "tax", label: "Tax", type: "number"},
                                {name: "vendor", label: "Vendor", type: "text"},
                                {name: "reference", label: "Reference", type: "text"},
                                {name: "description", label: "Description", type: "text", optional: true}
                            ].map(({name, label, type, optional}) => (
                                <FormGroup key={name}>
                                    <Label>{label}</Label>
                                    {type === "select" ? (
                                        <Input
                                            type="select"
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            invalid={!!formErrors[name]}
                                            required={!optional}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>{category.name}</option>
                                            ))}
                                        </Input>
                                    ) : (
                                        <Input
                                            type={type}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            invalid={!!formErrors[name]}
                                            required={!optional}
                                        />
                                    )}
                                    {formErrors[name] && <div className="text-danger">{formErrors[name]}</div>}
                                </FormGroup>
                            ))}

                            <Button type="submit"
                                    color="success">{editingExpense ? "Update Expense" : "Submit"}</Button>
                            {editingExpense &&
                                <Button color="secondary" onClick={resetForm} className="ml-2">Cancel</Button>}
                        </Form>
                    )}

                    <hr/>

                    <h4>Normal Expenses</h4>
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
                                        <Button color="warning" size="sm"
                                                onClick={() => handleEdit(expense)}>Edit</Button>
                                        <Button color="danger" size="sm" className="ml-2"
                                                onClick={() => handleDelete(expense._id)}>Delete</Button>
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

                    <hr/>

                    <h4>Daily Expenses</h4>
                    <Table bordered responsive>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dailyExpenses.length > 0 ? (
                            dailyExpenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>${expense.summary.totalExpenses}</td>
                                    <td>{expense.notes}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">No other expenses found</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>

                    <hr/>

                    <h4>Tax Report Expenses</h4>
                    <Table bordered responsive>
                        <thead>
                        <tr>
                            <th>Year</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {taxReportExpenses.length > 0 ? (
                            taxReportExpenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{expense.year}</td>
                                    <td>${expense.expenses}</td>
                                    <td>{expense.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">No other expenses found</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                    <hr/>
                    <h4>Summary</h4>
                    <Table bordered>
                        <tbody>
                        <tr>
                            <td><strong>Normal Expenses Total</strong></td>
                            <td>${totalExpenses.normaltotalExpenses}</td>
                        </tr>
                        <tr>
                            <td><strong>Daily Expenses Total</strong></td>
                            <td>${totalExpenses.dailytotalExpenses}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax Report Expenses Total</strong></td>
                            <td>${totalExpenses.taxtotalExpenses}</td>
                        </tr>
                        <tr>
                            <td><strong>All Expenses Total</strong></td>
                            <td>
                                ${totalExpenses.totalExpenses}
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                    <hr/>
                    <Button color="success" size="m"
                            onClick={() => generateExpenseReport(selectedBusiness)}>Generate Expense Report</Button>
                </Card>
            </Row>
        </Container>
    );
};

export default Expenses;
