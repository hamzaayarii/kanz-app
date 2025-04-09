import React, { useEffect, useState } from "react";
import { Container, Table, Button, Card, CardHeader, CardBody, Spinner } from "reactstrap";
import axios from "axios";
import Header from 'components/Headers/Header';

const AssignAccountant = () => {
    const [accountants, setAccountants] = useState([]);
    const [assigningId, setAssigningId] = useState(null);
    const [removingId, setRemovingId] = useState(null); // For removing assignment
    const [currentUser, setCurrentUser] = useState(null);
    const [assignedId, setAssignedId] = useState(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) return;

        // Get current logged-in user
        axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setCurrentUser(res.data);
            setAssignedId(res.data.assignedTo); // Save assigned accountant ID
        })
        .catch(err => console.error("Error fetching user:", err));

        // Get all accountants
        axios.get("http://localhost:5000/api/users/getUsersByRole?role=accountant", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setAccountants(res.data))
        .catch(err => console.error("Error fetching accountants:", err));
    }, [token]);

    // Handle the assignment of an accountant
    const handleAssign = (accountantId) => {
        setAssigningId(accountantId);

        axios.post("http://localhost:5000/api/users/assign", { accountantId }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            alert("Accountant assigned successfully!");
            setAssignedId(accountantId); // Update the assigned accountant
        })
        .catch(error => {
            console.error("Error assigning accountant:", error);
            alert("Failed to assign accountant.");
        })
        .finally(() => setAssigningId(null));
    };

    // Handle removing the assignment of an accountant
    const handleRemoveAssignment = () => {
        if (!assignedId) {
            alert("No accountant assigned to your business.");
            return;
        }

        setRemovingId(assignedId);

        axios.post("http://localhost:5000/api/users/removeAssignment", { accountantId: assignedId }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            alert("Accountant unassigned successfully!");
            setAssignedId(null); // Update the assigned accountant to null
        })
        .catch(error => {
            console.error("Error removing assignment:", error);
            alert("Failed to remove accountant assignment.");
        })
        .finally(() => setRemovingId(null));
    };

    // Show nothing if user is not a business owner
    if (!currentUser || currentUser.role !== "business_owner") return null;

    return (
        <>
            <Header />
            <Container className="mt-5">
                <Card>
                    <CardHeader>
                        <h3 className="mb-0">Assign an Accountant</h3>
                        <p className="text-sm text-muted">Select an accountant to assign to your business.</p>
                    </CardHeader>
                    <CardBody>
                        {accountants.length === 0 ? (
                            <p>No accountants found.</p>
                        ) : (
                            <Table bordered responsive hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountants.map((acc, index) => (
                                        <tr key={acc._id}>
                                            <td>{index + 1}</td>
                                            <td>{acc.fullName}</td>
                                            <td>{acc.email}</td>
                                            <td>
                                                {assignedId === acc._id ? (
                                                    <>
                                                        <span className="text-success fw-bold">Assigned</span>
                                                        <Button
                                                            color="danger"
                                                            size="sm"
                                                            onClick={handleRemoveAssignment}
                                                            disabled={removingId === acc._id}
                                                        >
                                                            {removingId === acc._id ? <Spinner size="sm" /> : "Remove Assignment"}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => handleAssign(acc._id)}
                                                        disabled={assigningId === acc._id || assignedId}
                                                    >
                                                        {assigningId === acc._id ? <Spinner size="sm" /> : "Assign"}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default AssignAccountant;
