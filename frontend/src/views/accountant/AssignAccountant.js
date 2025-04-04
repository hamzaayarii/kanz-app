import React, { useEffect, useState } from "react";
import { Container, Table, Button, Card, CardHeader, CardBody, Spinner } from "reactstrap";
import axios from "axios";
import Header from 'components/Headers/Header';

const AssignAccountant = () => {
    const [accountants, setAccountants] = useState([]);
    const [assigningId, setAssigningId] = useState(null);
    const [assignedAccountants, setAssignedAccountants] = useState([]);

    useEffect(() => {
        // Get the token from localStorage (or wherever it is stored)
        const token = localStorage.getItem("authToken"); // Replace with how you're storing the token
    
        // Make sure the token is included in the request headers
        axios.get("http://localhost:5000/api/users/getUsersByRole?role=accountant", {
            headers: {
                Authorization: `Bearer ${token}` // Send token in the Authorization header
            }
        })
            .then(response => {
                setAccountants(response.data);
            })
            .catch(error => console.error("Error fetching accountants:", error));
    }, []);

    const handleAssign = (accountantId) => {
        setAssigningId(accountantId);
        const token = localStorage.getItem("authToken"); 
    
        axios.post("http://localhost:5000/api/users/assign", 
            { accountantId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then(() => {
            alert("Accountant assigned successfully!");
            setAssignedAccountants(prev => [...prev, accountantId]);
        })
        .catch(error => {
            console.error("Error assigning accountant:", error);
            alert("Failed to assign accountant.");
        })
        .finally(() => {
            setAssigningId(null);
        });
    };
    
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
                                    {accountants.map((accountant, index) => {
                                        const isAssigned = assignedAccountants.includes(accountant._id); // Use _id instead of id
                                        const isAssigning = assigningId === accountant._id; // Use _id instead of id

                                        return (
                                            <tr key={accountant._id}>
                                                <td>{index + 1}</td>
                                                <td>{accountant.fullName}</td>
                                                <td>{accountant.email}</td>
                                                <td>
                                                    {isAssigned ? (
                                                        <span className="text-success fw-bold">Assigned</span>
                                                    ) : (
                                                        <Button
                                                            color="primary"
                                                            size="sm"
                                                            onClick={() => handleAssign(accountant._id)} // Use _id here
                                                            disabled={isAssigning}
                                                        >
                                                            {isAssigning ? <Spinner size="sm" /> : "Assign"}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
