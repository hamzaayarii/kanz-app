import React, { useEffect, useState } from "react";
import { Container, Table, Button, Card, CardHeader, CardBody } from "reactstrap";
import axios from "axios";

const AssignAccountant = () => {
    const [accountants, setAccountants] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch accountants from backend
    useEffect(() => {
        axios.get("/api/users?role=accountant") // Adjust this endpoint in the backend
            .then(response => setAccountants(response.data))
            .catch(error => console.error("Error fetching accountants:", error));
    }, []);

    // Handle assigning an accountant
    const handleAssign = (accountantId) => {
        setLoading(true);
        axios.post("/api/assign-accountant", { accountantId })
            .then(() => {
                alert("Accountant assigned successfully!");
            })
            .catch(error => {
                console.error("Error assigning accountant:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Container className="mt-5">
            <Card>
                <CardHeader>
                    <h3 className="mb-0">Assign an Accountant</h3>
                </CardHeader>
                <CardBody>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountants.map((accountant, index) => (
                                <tr key={accountant.id}>
                                    <td>{index + 1}</td>
                                    <td>{accountant.name}</td>
                                    <td>{accountant.email}</td>
                                    <td>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            disabled={loading}
                                            onClick={() => handleAssign(accountant.id)}
                                        >
                                            Assign
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Container>
    );
};

export default AssignAccountant;
