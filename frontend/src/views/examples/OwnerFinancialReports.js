import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Row,
    Card,
    FormGroup,
    Label,
    Input,
    Button,
    Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

const OwnerFinancialReports = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [financialReports, setFinancialReports] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserBusinesses();
    }, []);

    const fetchUserBusinesses = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return navigate("/auth/login");

            const res = await axios.get("http://localhost:5000/api/business/my-businesses", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userBusinesses = res.data.businesses || [];
            setBusinesses(userBusinesses);

            if (userBusinesses.length > 0) {
                setSelectedBusiness(userBusinesses[0]._id);
                fetchFinancialReports(userBusinesses[0]._id);
            }
        } catch (err) {
            console.error("Failed to load businesses", err);
            setError("Failed to load your businesses.");
        }
    };

    const fetchFinancialReports = async (businessId) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`http://localhost:5000/api/financial-Statement/list?businessId=${businessId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFinancialReports(res.data || []);
        } catch (err) {
            console.error("Failed to load reports", err);
            setError("Failed to load financial reports.");
        }
    };

    const downloadReport = async (reportId) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`http://localhost:5000/api/financial-Statement/download/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `financial-statement-${reportId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to download report.");
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Card className="p-4 shadow">
                    <h3>Your Financial Reports</h3>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <FormGroup>
                        <Label>Select Business</Label>
                        <Input
                            type="select"
                            value={selectedBusiness}
                            onChange={(e) => {
                                setSelectedBusiness(e.target.value);
                                fetchFinancialReports(e.target.value);
                            }}
                        >
                            {businesses.length > 0 ? (
                                businesses.map((biz) => (
                                    <option key={biz._id} value={biz._id}>{biz.name}</option>
                                ))
                            ) : (
                                <option>No businesses found</option>
                            )}
                        </Input>
                    </FormGroup>

                    <h5 className="mt-4">Available Reports</h5>
                    <Table bordered responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Type</th>
                            <th>Period Start</th>
                            <th>Period End</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {financialReports.length > 0 ? (
                            financialReports.map((report, idx) => (
                                <tr key={report._id}>
                                    <td>{idx + 1}</td>
                                    <td>{report.type}</td>
                                    <td>{new Date(report.periodStart).toLocaleDateString()}</td>
                                    <td>{new Date(report.periodEnd).toLocaleDateString()}</td>
                                    <td>
                                        <Button size="sm" color="success" onClick={() => downloadReport(report._id)}>
                                            Download
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5">No reports found.</td></tr>
                        )}
                        </tbody>
                    </Table>
                </Card>
            </Row>
        </Container>
    );
};

export default OwnerFinancialReports;
