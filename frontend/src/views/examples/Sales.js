import React, { useEffect, useState } from "react";
import axios from "axios";

// reactstrap components
import { Card, Container, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";

// core components
import Header from "components/Headers/Header.js";

const SalesContent = ({ salesData }) => {
  return (
    <div>
      <h1>Sales Data</h1>
      <ul>
        {salesData.map((sale, index) => (
          <li key={index}>{sale.product}: {sale.quantity} units at ${sale.price}</li>
        ))}
      </ul>
    </div>
  );
};

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [showSales, setShowSales] = useState(false);
  const [showAddSaleForm, setShowAddSaleForm] = useState(false);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    // Replace with your backend API endpoint
    axios.get("http://localhost:5000/api/sales")
      .then(response => {
        setSalesData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the sales data!", error);
      });
  }, []);

  const handleAddSale = () => {
    setShowAddSaleForm(!showAddSaleForm);
  };

  const handleShowSales = () => {
    setShowSales(!showSales);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSale = { product, quantity: parseInt(quantity), price: parseFloat(price) };
    axios.post("http://localhost:5000/api/sales", newSale)
      .then(response => {
        console.log("Sale added:", response.data);
        setSalesData([...salesData, response.data]); // Update sales data state
        setShowAddSaleForm(false);
        setProduct("");
        setQuantity("");
        setPrice("");
      })
      .catch(error => {
        console.error("There was an error adding the sale!", error);
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
                <Button color="primary" onClick={handleAddSale}>Add Sale</Button>
                <Button color="secondary" onClick={handleShowSales} className="ml-2">
                  {showSales ? "Hide Sales" : "Show Sales"}
                </Button>
              </div>
              {showAddSaleForm && (
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
              {showSales && <SalesContent salesData={salesData} />}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Sales;
