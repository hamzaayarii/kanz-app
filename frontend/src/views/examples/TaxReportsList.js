import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

const TaxReportsList = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);  // Add loading state
    const [modal, setModal] = useState(false);  // Modal state
    const [selectedReport, setSelectedReport] = useState(null);  // Track selected report for editing
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setError('');  // Clear any previous errors
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:5000/api/taxReports/reports', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.data && response.data.reports) {
                    console.log("Reports fetched:", response.data.reports);
                    setReports(response.data.reports);
                } else {
                    throw new Error("Invalid response format.");
                }
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError("Failed to load tax reports. Please try again.");
            } finally {
                setLoading(false);  // Set loading to false after the request is done
            }
        };

        fetchReports();  // Call the fetch function inside useEffect
    }, []);

    // Handle delete of a tax report
    const deleteReport = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/taxReports/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setReports(reports.filter((report) => report._id !== id)); // Update the state to remove the deleted report
        } catch (err) {
            console.error("Error deleting tax report:", err);
            setError("Failed to delete the tax report. Please try again.");
        }
    };

    // Handle update of a tax report
    const updateReport = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const updatedData = { income, expenses, year };

            const response = await axios.put(`http://localhost:5000/api/taxReports/update/${id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Update the report in the state after the update
            setReports(reports.map((report) => (report._id === id ? response.data.taxReport : report)));
            toggleModal();  // Close the modal after the update
        } catch (err) {
            console.error("Error updating tax report:", err);
            setError("Failed to update the tax report. Please try again.");
        }
    };

    // Toggle the modal
    const toggleModal = () => {
        setModal(!modal);
    };

    // Open the modal to edit a specific report
    const openEditModal = (report) => {
        setSelectedReport(report);
        setIncome(report.income);
        setExpenses(report.expenses);
        setYear(report.year);
        toggleModal();
    };

    return (
        <Container>
            <h2>Your Tax Reports</h2>
            {error && <Alert color="danger">{error}</Alert>}

            {loading ? (  // Show loading spinner while fetching data
                <div className="d-flex justify-content-center">
                    <Spinner color="primary" />
                </div>
            ) : (
                <Table bordered>
                    <thead>
                    <tr>
                        <th>Year</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Calculated Tax</th>
                        <th>Actions</th> {/* Add a column for actions */}
                    </tr>
                    </thead>
                    <tbody>
                    {reports.length > 0 ? (
                        reports.map(report => (
                            <tr key={report._id}>
                                <td>{report.year}</td>
                                <td>{report.income}</td>
                                <td>{report.expenses}</td>
                                <td>{report.calculatedTax}</td>
                                <td>
                                    {/* Add update and delete buttons */}
                                    <Button color="warning" onClick={() => openEditModal(report)}>
                                        Update
                                    </Button>
                                    <Button color="danger" onClick={() => deleteReport(report._id)} className="ml-2">
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No tax reports found.</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            )}

            {/* Modal for editing the tax report */}
            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Update Tax Report</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="year">Year</Label>
                            <Input
                                type="number"
                                name="year"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="income">Income</Label>
                            <Input
                                type="number"
                                name="income"
                                id="income"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="expenses">Expenses</Label>
                            <Input
                                type="number"
                                name="expenses"
                                id="expenses"
                                value={expenses}
                                onChange={(e) => setExpenses(e.target.value)}
                                required
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => updateReport(selectedReport._id)}>
                        Save Changes
                    </Button>
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default TaxReportsList;
