import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardHeader,
    CardBody,
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
import { useNavigate } from "react-router-dom";
import HoverSpeakText from '../../components/TTS/HoverSpeakText'; // Adjust path as needed
import TTSButton from '../../components/TTS/TTSButton'; // Adjust path as needed
import { useTTS } from '../../components/TTS/TTSContext'; // Adjust path as needed

const Invoices = () => {
    const [invoiceName, setInvoiceName] = useState("");
    const [invoiceType, setInvoiceType] = useState("sale");
    const [file, setFile] = useState(null);
    const [uploadedInvoices, setUploadedInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [businessId, setBusinessId] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const { isTTSEnabled, speak, stop } = useTTS();

    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const authHeader = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const fetchBusinesses = async () => {
        try {
            if (!token) {
                navigate("/auth/login");
                return;
            }

            const response = await axios.get("http://localhost:5000/api/business/user-businesses", authHeader);
            setBusinesses(response.data.businesses);

            if (response.data.length > 0) {
                setBusinessId(response.data[0]._id);
            }
        } catch (err) {
            console.error("Error fetching businesses", err);
        }
    };

    const fetchInvoices = async (id) => {
        if (!id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/invoices1?businessId=${id}`, authHeader);
            setUploadedInvoices(res.data);
        } catch (err) {
            console.error("Error fetching invoices", err);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        if (businessId) {
            fetchInvoices(businessId);
        }
    }, [businessId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoiceName || !file || !businessId) {
            alert("Please provide all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("invoiceName", invoiceName);
        formData.append("invoiceType", invoiceType);
        formData.append("file", file);
        formData.append("businessId", businessId);

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5000/api/invoices1", formData, {
                ...authHeader,
                headers: {
                    ...authHeader.headers,
                    "Content-Type": "multipart/form-data"
                }
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
            await axios.delete(`http://localhost:5000/api/invoices1/${id}`, authHeader);
            setUploadedInvoices(uploadedInvoices.filter((invoice) => invoice._id !== id));
        } catch (err) {
            console.error("Error deleting invoice", err);
        }
    };

    return (
        <>
            <Container className="mt-4" fluid>
                <Row>
                    <Col>
                        <Card className="shadow mb-4" id="upload-invoice-card">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">
                                    <HoverSpeakText>📤 Upload Invoice</HoverSpeakText>
                                    {isTTSEnabled && (
                                        <TTSButton
                                            elementId="upload-invoice-card"
                                            className="ml-2"
                                            size="sm"
                                            label="Read all invoice information"
                                        />
                                    )}
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <HoverSpeakText textToSpeak="Select Business">
                                        <Label for="businessSelector">Select Business</Label>
                                    </HoverSpeakText>
                                    <Input
                                        type="select"
                                        id="businessSelector"
                                        value={businessId}
                                        onChange={(e) => setBusinessId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a business</option>
                                        {businesses.map((b) => (
                                            <option key={b._id} value={b._id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <HoverSpeakText textToSpeak="Invoice Name">
                                            <Label for="invoiceName">Invoice Name</Label>
                                        </HoverSpeakText>
                                        <Input
                                            type="text"
                                            id="invoiceName"
                                            value={invoiceName}
                                            onChange={(e) => setInvoiceName(e.target.value)}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <HoverSpeakText textToSpeak="Invoice Type">
                                            <Label for="invoiceType">Invoice Type</Label>
                                        </HoverSpeakText>
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
                                        <HoverSpeakText textToSpeak="Upload Invoice PDF or Image">
                                            <Label for="file">Upload Invoice (PDF/Image)</Label>
                                        </HoverSpeakText>
                                        <Input type="file" id="file" onChange={handleFileChange} required />
                                    </FormGroup>
                                    <HoverSpeakText textToSpeak={loading ? "Uploading..." : "Upload Invoice"}>
                                        <Button type="submit" color="primary" disabled={loading}>
                                            {loading ? <Spinner size="sm" /> : "Upload"}
                                        </Button>
                                    </HoverSpeakText>
                                </Form>
                            </CardBody>
                        </Card>

                        <Card className="shadow" id="uploaded-invoices-card">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">
                                    <HoverSpeakText>🧾 Uploaded Invoices</HoverSpeakText>
                                    <TTSButton
                                        text="This section shows all your uploaded invoices"
                                        className="ml-2"
                                        size="sm"
                                        elementId="uploaded-invoices-card"
                                    />
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <ListGroup flush>
                                    {uploadedInvoices.length === 0 && (
                                        <p className="text-muted">
                                            <HoverSpeakText>No invoices uploaded yet.</HoverSpeakText>
                                        </p>
                                    )}
                                    {uploadedInvoices.map((invoice) => (
                                        <ListGroupItem
                                            key={invoice._id}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <HoverSpeakText>
                                                    <strong>{invoice.invoiceName}</strong> ({invoice.invoiceType})
                                                </HoverSpeakText>
                                                <br />
                                                <HoverSpeakText textToSpeak={`View invoice file for ${invoice.invoiceName}`}>
                                                    <a
                                                        href={`http://localhost:5000/${invoice.filePath}?token=${token}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View File
                                                    </a>
                                                </HoverSpeakText>
                                            </div>
                                            <HoverSpeakText textToSpeak={`Delete invoice ${invoice.invoiceName}`}>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(invoice._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </HoverSpeakText>
                                        </ListGroupItem>
                                    ))}
                                </ListGroup>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Invoices;