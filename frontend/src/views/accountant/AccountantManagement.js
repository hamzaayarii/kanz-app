import React, { useEffect, useState } from "react";
import { Alert, Button, Table } from "reactstrap";
import axios from "axios";

const AccountantManagement = () => {
    const [accountants, setAccountants] = useState([]);
    const [selectedAccountant, setSelectedAccountant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch accountants from the backend
    useEffect(() => {
        setLoading(true);

        // Get the authorization token
        const token = localStorage.getItem('authToken');

        // Make the API call with the token
        axios.get("http://localhost:5000/api/business/list-accountant", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                console.log("Accountants data:", response.data);
                setAccountants(response.data);
                setError(null);
            })
            .catch(error => {
                console.error("Error fetching accountants:", error);
                setError(`Failed to load accountants: ${error.response?.data?.message || error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleAssignAccountant = (accountantId) => {
        setLoading(true);

        // Get the authorization token
        const token = localStorage.getItem('authToken');

        // Update to use the correct endpoint from your API
        axios.post("http://localhost:5000/api/business/assign-accountant",
            { accountantId },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                alert("Accountant assigned successfully!");
                setSelectedAccountant(accountantId);
                setError(null);
            })
            .catch(error => {
                console.error("Error assigning accountant:", error);
                setError(`Failed to assign accountant: ${error.response?.data?.message || error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="mt-4">
            <h4>Accountant Management</h4>

            {error && <Alert color="danger">{error}</Alert>}

            {loading && accountants.length === 0 ? (
                <p>Loading accountants...</p>
            ) : accountants.length === 0 ? (
                <Alert color="info">No accountants found.</Alert>
            ) : (
                <Table bordered>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accountants.map((accountant, index) => (
                            <tr key={accountant._id}>
                                <td>{index + 1}</td>
                                <td>{accountant.fullName}</td>
                                <td>{accountant.email}</td>
                                <td>{accountant.phoneNumber || 'N/A'}</td>
                                <td>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        disabled={loading || selectedAccountant === accountant._id}
                                        onClick={() => handleAssignAccountant(accountant._id)}
                                    >
                                        {selectedAccountant === accountant._id ? "Assigned" : "Assign"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default AccountantManagement;