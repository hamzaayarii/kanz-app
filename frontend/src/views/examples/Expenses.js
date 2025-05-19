import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input, Table, Col, CardHeader, CardBody ,Alert } from "reactstrap";
import { useNavigate } from "react-router-dom";
import HoverSpeakText from '../../components/TTS/HoverSpeakText'; // Adjust path as needed
import TTSButton from '../../components/TTS/TTSButton'; // Adjust path as needed
import { useTTS } from '../../components/TTS/TTSContext'; // Adjust path as needed
import ReceiptScanner from '../../components/ReceiptScanner/ReceiptScanner.jsx'; 
const Expenses = () => {
  const navigate = useNavigate();
  const { isTTSEnabled, speak, stop } = useTTS();
  const [data, setData] = useState({
    expenses: [],
    dailyExpenses: [],
    taxReportExpenses: [],
    businesses: [],
    categories: [],
    totalExpenses: { normaltotalExpenses: 0, dailytotalExpenses: 0, taxtotalExpenses: 0, totalExpenses: 0 },
  });
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
const [scannedData, setScannedData] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [form, setForm] = useState({
    isVisible: false,
    editingExpense: null,
    data: { business: "", category: "", date: "", amount: "", tax: "", vendor: "", reference: "", description: "" },
    errors: {},
  });
const handleReceiptScan = (data) => {
  setScannedData(data);
  setShowReceiptScanner(false);
  
  // Auto-fill the form with scanned data
  setForm(prev => ({
    ...prev,
    isVisible: true,
    data: {
      ...prev.data,
      date: data.date || "",
      amount: data.amount || "",
      tax: data.tax || "",
      vendor: data.vendor || "",
      reference: data.reference || "",
      description: data.description || ""
    }
  }));
};
  const validationRules = useMemo(
    () => ({
      category: { required: true, message: "Category is required" },
      date: { required: true, message: "Date is required" },
      amount: { required: true, min: 0.01, message: "Amount must be greater than 0" },
      tax: { required: true, message: "Tax is required" },
      vendor: { required: true, message: "Vendor is required" },
      reference: { required: true, message: "Reference is required" },
    }),
    []
  );

  const validateForm = useCallback(() => {
    const errors = {};
    Object.entries(validationRules).forEach(([field, rule]) => {
      const value = form.data[field];
      if (rule.required && !value) {
        errors[field] = rule.message;
      } else if (rule.min && parseFloat(value) < rule.min) {
        errors[field] = rule.message;
      }
    });
    return errors;
  }, [form.data, validationRules]);

  const fetchInitialData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/auth/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [businessesRes, categoriesRes, taxReportRes] = await Promise.all([
        axios.get("http://localhost:5000/api/business/user-businesses", { headers }),
        axios.get("http://localhost:5000/api/categories", { headers }),
        axios.get("http://localhost:5000/api/expenses/taxreport-expenses", { headers }),
      ]);
      setData((prev) => ({
        ...prev,
        businesses: businessesRes.data.businesses,
        categories: categoriesRes.data,
        taxReportExpenses: taxReportRes.data,
      }));
      if (businessesRes.data.businesses.length > 0) {
        setSelectedBusiness(businessesRes.data.businesses[0]._id);
      }
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  }, [navigate]);

  const fetchBusinessData = useCallback(async (businessId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/auth/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [expensesRes, dailyExpensesRes, totalExpensesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/expenses?business=${businessId}`, { headers }),
        axios.get(`http://localhost:5000/api/expenses/daily-expenses?business=${businessId}`, { headers }),
        axios.get(`http://localhost:5000/api/expenses/total-expenses?business=${businessId}`, { headers }),
      ]);
      setData((prev) => ({
        ...prev,
        expenses: expensesRes.data,
        dailyExpenses: dailyExpensesRes.data,
        totalExpenses: totalExpensesRes.data,
      }));
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessData(selectedBusiness);
    }
  }, [selectedBusiness, fetchBusinessData]);

  const generateExpenseReport = useCallback(async (businessId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/auth/login");
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/expenses/generate-expense-report?businessId=${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-report-${businessId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report", error);
    }
  }, [navigate]);

  // Remove debounce, handle change immediately
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      errors: {
        ...prev.errors,
        [name]: validationRules[name]?.required && !value ? validationRules[name].message : undefined,
      },
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setForm((prev) => ({ ...prev, errors }));
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/auth/login");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        if (form.editingExpense) {
          await axios.put(`http://localhost:5000/api/expenses/${form.editingExpense._id}`, form.data, { headers });
        } else {
          await axios.post("http://localhost:5000/api/expenses", { ...form.data, business: selectedBusiness }, { headers });
        }
        fetchBusinessData(selectedBusiness);
        setForm({
          isVisible: false,
          editingExpense: null,
          data: { business: "", category: "", date: "", amount: "", tax: "", vendor: "", reference: "", description: "" },
          errors: {},
        });
      } catch (error) {
        console.error("Error saving expense", error);
      }
    },
    [form.data, form.editingExpense, selectedBusiness, validateForm, fetchBusinessData, navigate]
  );

  const handleEdit = useCallback((expense) => {
    const formattedDate = new Date(expense.date).toISOString().split("T")[0];
    setForm({
      isVisible: true,
      editingExpense: expense,
      data: { ...expense, date: formattedDate },
      errors: {},
    });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this expense?")) {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            navigate("/auth/login");
            return;
          }
          await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchBusinessData(selectedBusiness);
        } catch (error) {
          console.error("Error deleting expense", error);
        }
      }
    },
    [selectedBusiness, fetchBusinessData, navigate]
  );

  const getCategoryName = useCallback(
    (categoryId) => {
      const category = data.categories.find((cat) => cat._id === categoryId);
      return category ? category.name : "Unknown Category";
    },
    [data.categories]
  );

  const ExpenseForm = useMemo(
    () =>
      ({ isVisible, formData, errors, categories, onSubmit, onChange, onCancel, editingExpense }) =>
        isVisible && (
          <Form onSubmit={onSubmit} className="mt-3">
            {[
              { name: "category", label: "Category", type: "select" },
              { name: "date", label: "Date", type: "date" },
              { name: "amount", label: "Amount", type: "number" },
              { name: "tax", label: "Tax", type: "number" },
              { name: "vendor", label: "Vendor", type: "text" },
              { name: "reference", label: "Reference", type: "text" },
              { name: "description", label: "Description", type: "text", optional: true },
            ].map(({ name, label, type, optional }) => (
              <FormGroup key={name}>
                <Label>{label}</Label>
                {type === "select" ? (
                  <Input
                    type="select"
                    name={name}
                    value={formData[name]}
                    onChange={onChange}
                    invalid={!!errors[name]}
                    required={!optional}
                  >
                    <option value="">Select a {label.toLowerCase()}</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Input>
                ) : (
                  <Input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={onChange}
                    invalid={!!errors[name]}
                    required={!optional}
                  />
                )}
                {errors[name] && <div className="text-danger">{errors[name]}</div>}
              </FormGroup>
            ))}
            
            <Button type="submit" color="success">
              {editingExpense ? "Update Expense" : "Submit"}
            </Button>
            {editingExpense && (
              <Button color="secondary" onClick={onCancel} className="ml-2">
                Cancel
              </Button>
            )}
          </Form>
        ),
    []
  );
  return (
    <Container className="mt-4" fluid>
      <Row>
        <Col>
          <Card className="shadow" id="expenses-container" style={{ backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
            <CardHeader className="border-0" style={{ 
              background: 'linear-gradient(to right, #0E6D6B, #1BA39C)', 
              color: '#FFFFFF',
              borderRadius: '10px 10px 0 0'
            }}>
              <Row className="align-items-center justify-content-between">
                <Col md="auto">
                  <h3 className="mb-0">
                    <HoverSpeakText>Manage Expenses</HoverSpeakText>
                    {isTTSEnabled && (
                      <TTSButton 
                        elementId="expenses-container"
                        className="ml-2"
                        size="sm"
                        label="Read all expenses information"
                      />
                    )}
                  </h3>
                </Col>
                <Col md="auto">
                  <Row className="align-items-center">
                    <Col xs="auto" className="pr-2">
                      <FormGroup className="mb-0">
                        <HoverSpeakText textToSpeak="Select Business">
                          <Input
                            type="select"
                            bsSize="sm"
                            value={selectedBusiness}
                            onChange={(e) => setSelectedBusiness(e.target.value)}
                          >
                            {data.businesses.map((biz) => (
                              <option key={biz._id} value={biz._id}>
                                {biz.name}
                              </option>
                            ))}
                          </Input>
                        </HoverSpeakText>
                      </FormGroup>
                    </Col>
                    <Col xs="auto">
                      <HoverSpeakText textToSpeak="Scan receipt">
                        <Button
                          color="info"
                          size="sm"
                          onClick={() => setShowReceiptScanner(true)}
                          className="mr-2"
                          style={{ 
                            backgroundColor: '#00BCD4', 
                            borderColor: '#00BCD4'
                          }}
                        >
                          Scan Receipt
                        </Button>
                      </HoverSpeakText>
                      <HoverSpeakText textToSpeak={form.isVisible ? "Hide expense form" : "Add new expense"}>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() =>
                            setForm({
                              isVisible: true,
                              editingExpense: null,
                              data: { business: "", category: "", date: "", amount: "", tax: "", vendor: "", reference: "", description: "" },
                              errors: {},
                            })
                          }
                          style={{ 
                            backgroundColor: '#1BA39C', 
                            borderColor: '#1BA39C'
                          }}
                        >
                          {form.isVisible ? "Hide Form" : "Add Expense"}
                        </Button>
                      </HoverSpeakText>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {/* NEW: Notification when scanned data is available */}
              {scannedData && form.isVisible && (
                <Alert color="info" className="mb-3">
                  <HoverSpeakText>
                    Form pre-filled with data from scanned receipt. Please review and complete the remaining fields.
                  </HoverSpeakText>
                </Alert>
              )}

              <ExpenseForm
                isVisible={form.isVisible}
                formData={form.data}
                errors={form.errors}
                categories={data.categories}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onCancel={() =>
                  setForm({
                    isVisible: false,
                    editingExpense: null,
                    data: { business: "", category: "", date: "", amount: "", tax: "", vendor: "", reference: "", description: "" },
                    errors: {},
                  })
                }
                editingExpense={form.editingExpense}
              />

              {form.isVisible && <hr />}

              {/* Expenses Table */}
              <h4 style={{ color: '#1BA39C' }}>
                <HoverSpeakText>Normal Expenses</HoverSpeakText>
                <TTSButton 
                  text="This table shows all your normal expenses by category, date, amount, and vendor information"
                  className="ml-2"
                  size="sm"
                />
              </h4>
              <Table bordered responsive>
                <thead style={{ backgroundColor: '#0E6D6B', color: 'white' }}>
                  <tr>
                    {['Category', 'Date', 'Amount', 'Tax', 'Vendor', 'Reference', 'Description', 'Actions'].map((header) => (
                      <th key={header}>
                        <HoverSpeakText>{header}</HoverSpeakText>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.length > 0 ? (
                    data.expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td><HoverSpeakText>{getCategoryName(expense.category)}</HoverSpeakText></td>
                        <td><HoverSpeakText>{new Date(expense.date).toLocaleDateString()}</HoverSpeakText></td>
                        <td><HoverSpeakText>${expense.amount}</HoverSpeakText></td>
                        <td><HoverSpeakText>${expense.tax}</HoverSpeakText></td>
                        <td><HoverSpeakText>{expense.vendor}</HoverSpeakText></td>
                        <td><HoverSpeakText>{expense.reference}</HoverSpeakText></td>
                        <td><HoverSpeakText>{expense.description}</HoverSpeakText></td>
                        <td>
                          <HoverSpeakText textToSpeak={`Edit ${getCategoryName(expense.category)} expense`}>
                            <Button 
                              color="warning" 
                              size="sm" 
                              onClick={() => handleEdit(expense)}
                              style={{ 
                                backgroundColor: '#F57C00', 
                                borderColor: '#F57C00',
                                marginRight: '8px'
                              }}
                            >
                              Edit
                            </Button>
                          </HoverSpeakText>
                          <HoverSpeakText textToSpeak={`Delete ${getCategoryName(expense.category)} expense`}>
                            <Button 
                              color="danger" 
                              size="sm" 
                              className="ml-2" 
                              onClick={() => handleDelete(expense._id)}
                            >
                              Delete
                            </Button>
                          </HoverSpeakText>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <HoverSpeakText>No expenses found</HoverSpeakText>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <hr />
              <HoverSpeakText textToSpeak="Generate expense report">
                <Button
                  color="success"
                  size="m"
                  onClick={() => generateExpenseReport(selectedBusiness)}
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    borderColor: '#4CAF50'
                  }}
                >
                  Generate Expense Report
                </Button>
              </HoverSpeakText>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* NEW: Receipt Scanner Modal */}
      {showReceiptScanner && (
        <ReceiptScanner 
          onDataExtracted={handleReceiptScan}
          onClose={() => setShowReceiptScanner(false)}
        />
      )}
    </Container>
  );
};

export default Expenses;