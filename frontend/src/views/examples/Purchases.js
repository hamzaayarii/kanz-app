import React, { useEffect, useState } from "react";
import axios from "axios";

// reactstrap components
import { Card, Container, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";

// core components
import Header from "components/Headers/Header.js";

const PurchasesContent = ({ purchasesData }) => {
    return (
        <div>
            <h1>Purchases Data</h1>
            <ul>
                {purchasesData.map((purchase, index) => (
                    <li key={index}>{purchase.product}: {purchase.quantity} units at ${purchase.price}</li>
                ))}
            </ul>
        </div>
    );
};

const Purchases = () => {
    const [purchasesData, setPurchasesData] = useState([]);
    const [showPurchases, setShowPurchases] = useState(false);
    const [showAddPurchaseForm, setShowAddPurchaseForm] = useState(false);
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        // Replace with your backend API endpoint
        axios.get("http://localhost:5000/api/purchases")
            .then(response => {
                setPurchasesData(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the purchases data!", error);
            });
    }, []);

    const handleAddPurchase = () => {
        setShowAddPurchaseForm(!showAddPurchaseForm);
    };

    const handleShowPurchases = () => {
        setShowPurchases(!showPurchases);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPurchase = { product, quantity: parseInt(quantity), price: parseFloat(price) };
        axios.post("http://localhost:5000/api/purchases", newPurchase)
            .then(response => {
                console.log("Purchase added:", response.data);
                setPurchasesData([...purchasesData, response.data]); // Update purchases data state
                setShowAddPurchaseForm(false);
                setProduct("");
                setQuantity("");
                setPrice("");
            })
            .catch(error => {
                console.error("There was an error adding the purchase!", error);
            });
    };

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow border-0">
                            <div className="p-4">
                                <Button color="primary" onClick={handleAddPurchase}>Add Purchase</Button>
                                <Button color="secondary" onClick={handleShowPurchases} className="ml-2">
                                    {showPurchases ? "Hide Purchases" : "Show Purchases"}
                                </Button>
                            </div>
                            {showAddPurchaseForm && (
                                <div className="p-4">
                                    <Form onSubmit={handleSubmit}>
                                        <FormGroup>
                                            <Label for="product">Product</Label>
                                            <Input
                                                type="text"
                                                name="product"
                                                id="product"
                                                value={product}
                                                onChange={(e) => setProduct(e.target.value)}
                                                required
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="quantity">Quantity</Label>
                                            <Input
                                                type="number"
                                                name="quantity"
                                                id="quantity"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                required
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="price">Price</Label>
                                            <Input
                                                type="number"
                                                name="price"
                                                id="price"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                required
                                            />
                                        </FormGroup>
                                        <Button type="submit" color="primary">Submit</Button>
                                    </Form>
                                </div>
                            )}
                            {showPurchases && <PurchasesContent purchasesData={purchasesData} />}
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default Purchases;
