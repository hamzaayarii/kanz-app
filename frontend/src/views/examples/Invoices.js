import React, { useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";
import Header from "components/Headers/Header.js";

const Invoices = () => {
    const [invoiceName, setInvoiceName] = useState("");
    const [invoiceType, setInvoiceType] = useState("sale"); // Default type
    const [file, setFile] = useState(null);
    const [uploadedInvoices, setUploadedInvoices] = useState([]);

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
        formData.append("invoiceType", invoiceType); // Include invoice type
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/api/invoices", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadedInvoices([...uploadedInvoices, response.data]);
            setInvoiceName("");
            setFile(null);
            setInvoiceType("sale"); // Reset after upload
        } catch (error) {
            console.error("Error uploading invoice", error);
        }
    };

    return (
        <>
            <Header />
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Card className="shadow p-4">
                        <h3>Upload Invoice</h3>
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
                            <Button type="submit" color="primary">Upload</Button>
                        </Form>
                        <hr />
                        <h4>Uploaded Invoices</h4>
                        <ul>
                            {uploadedInvoices.map((invoice, index) => (
                                <li key={index}>
                                    {invoice.invoiceName} ({invoice.invoiceType}) -
                                    <a href={`http://localhost:5000/${invoice.filePath}`} target="_blank" rel="noopener noreferrer"> View</a>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Row>
            </Container>
        </>
    );
}

export default Invoices;
