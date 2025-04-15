import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    Container,
    Row,
    Col,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    ListGroup,
    ListGroupItem,
    Spinner
} from "reactstrap";
import Header from "components/Headers/Header.js";

const Invoices = () => {
    const [invoiceName, setInvoiceName] = useState("");
    const [invoiceType, setInvoiceType] = useState("sale");
    const [file, setFile] = useState(null);
    const [uploadedInvoices, setUploadedInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInvoices = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/invoices1");
            setUploadedInvoices(res.data);
        } catch (err) {
            console.error("Error fetching invoices", err);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoiceName || !file) {
            alert("Please provide an invoice name and a file.");
            return;
        }

        const formData = new FormData();
        formData.append("invoiceName", invoiceName);
        formData.append("invoiceType", invoiceType);
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5000/api/invoices1", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadedInvoices([...uploadedInvoices, response.data]);
            setInvoiceName("");
            setFile(null);
            setInvoiceType("sale");
        } catch (error) {
            console.error("Error uploading invoice", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/invoices1/${id}`);
            setUploadedInvoices(uploadedInvoices.filter((invoice) => invoice._id !== id));
        } catch (err) {
            console.error("Error deleting invoice", err);
        }
    };

    return (
        <>
            <Header />
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col lg="8">
                        <Card className="shadow p-4">
                            <h3 className="mb-4">📤 Upload Invoice</h3>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="invoiceName">Invoice Name</Label>
                                    <Input
                                        type="text"
                                        id="invoiceName"
                                        value={invoiceName}
                                        onChange={(e) => setInvoiceName(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="invoiceType">Invoice Type</Label>
                                    <Input
                                        type="select"
                                        id="invoiceType"
                                        value={invoiceType}
                                        onChange={(e) => setInvoiceType(e.target.value)}
                                        required
                                    >
                                        <option value="sale">Sale</option>
                                        <option value="purchase">Purchase</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="file">Upload Invoice (PDF/Image)</Label>
                                    <Input type="file" id="file" onChange={handleFileChange} required />
                                </FormGroup>
                                <Button type="submit" color="primary" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : "Upload"}
                                </Button>
                            </Form>

                            <hr className="my-4" />
                            <h4 className="mb-3">🧾 Uploaded Invoices</h4>

                            <ListGroup flush>
                                {uploadedInvoices.length === 0 && (
                                    <p className="text-muted">No invoices uploaded yet.</p>
                                )}
                                {uploadedInvoices.map((invoice) => (
                                    <ListGroupItem
                                        key={invoice._id}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <strong>{invoice.invoiceName}</strong> ({invoice.invoiceType})<br />
                                            <a
                                                href={`http://localhost:5000/${invoice.filePath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View File
                                            </a>
                                        </div>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => handleDelete(invoice._id)}
                                        >
                                            Delete
                                        </Button>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Invoices;

