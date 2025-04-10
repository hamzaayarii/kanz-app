import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    Table,
    Button,
    Badge
} from 'reactstrap';
import axios from 'axios';
import Header from "components/Headers/Header.js";

const DailyRevenueList = () => {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/daily-revenue', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Initialize entries as an empty array if response.data.data is undefined
            setEntries(response.data.data || []);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch daily revenue entries');
            setIsLoading(false);
            console.error('Error fetching daily revenue:', err);
        }
    };

    const calculateTotalRevenue = (entry) => {
        const cashNet = entry.revenues.cash.sales - entry.revenues.cash.returns;
        const cardNet = entry.revenues.card.sales - entry.revenues.card.returns;
        const otherRevenue = entry.revenues.other.reduce((sum, item) => sum + item.amount, 0);
        return cashNet + cardNet + otherRevenue;
    };

    const calculateTotalExpenses = (entry) => {
        const pettyExpenses = entry.expenses.petty || 0;
        const otherExpenses = entry.expenses.other.reduce((sum, item) => sum + item.amount, 0);
        return pettyExpenses + otherExpenses;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'TND'
        }).format(amount);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <Col xs="8">
                                        <h3 className="mb-0">Daily Revenue List</h3>
                                    </Col>
                                    <Col className="text-right" xs="4">
                                        <Button
                                            color="primary"
                                            href="#pablo"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.href = '/admin/daily-revenue';
                                            }}
                                            size="sm"
                                        >
                                            Add New Entry
                                        </Button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Table className="align-items-center table-flush" responsive>
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Cash Sales</th>
                                            <th>Card Sales</th>
                                            <th>Other Revenue</th>
                                            <th>Total Revenue</th>
                                            <th>Total Expenses</th>
                                            <th>Net Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry) => {
                                            const totalRevenue = calculateTotalRevenue(entry);
                                            const totalExpenses = calculateTotalExpenses(entry);
                                            const netAmount = totalRevenue - totalExpenses;

                                            return (
                                                <tr key={entry._id}>
                                                    <td>{formatDate(entry.date)}</td>
                                                    <td>
                                                        {formatCurrency(entry.revenues.cash.sales - entry.revenues.cash.returns)}
                                                    </td>
                                                    <td>
                                                        {formatCurrency(entry.revenues.card.sales - entry.revenues.card.returns)}
                                                    </td>
                                                    <td>
                                                        {formatCurrency(entry.revenues.other.reduce((sum, item) => sum + item.amount, 0))}
                                                    </td>
                                                    <td className="text-success">
                                                        {formatCurrency(totalRevenue)}
                                                    </td>
                                                    <td className="text-danger">
                                                        {formatCurrency(totalExpenses)}
                                                    </td>
                                                    <td>
                                                        <Badge color={netAmount >= 0 ? "success" : "danger"}>
                                                            {formatCurrency(netAmount)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default DailyRevenueList;
