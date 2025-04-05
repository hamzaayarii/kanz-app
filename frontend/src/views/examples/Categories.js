import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Button, Form, FormGroup, Label, Input, Table } from "reactstrap";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: "" });
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, formData);
            } else {
                await axios.post("http://localhost:5000/api/categories", formData);
            }
            fetchCategories();
            resetForm();
        } catch (error) {
            console.error("Error saving category", error);
        }
    };

    const handleEdit = (category) => {
        setFormData(category);
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await axios.delete(`http://localhost:5000/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: "" });
        setEditingCategory(null);
        setShowForm(false);
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Card className="shadow p-4">
                    <h3>Manage Categories</h3>

                    <Button color="primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Hide Form" : "Add Category"}
                    </Button>

                    {showForm && (
                        <Form onSubmit={handleSubmit} className="mt-3">
                            <FormGroup>
                                <Label>Name</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>
                            <Button type="submit" color="success">
                                {editingCategory ? "Update Category" : "Submit"}
                            </Button>
                            {editingCategory && (
                                <Button color="secondary" onClick={resetForm} className="ml-2">
                                    Cancel
                                </Button>
                            )}
                        </Form>
                    )}

                    <hr />

                    <h4>Categories List</h4>
                    <Table bordered responsive>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>
                                        <Button
                                            color="warning"
                                            size="sm"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="ml-2"
                                            onClick={() => handleDelete(category._id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">
                                    No categories found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card>
            </Row>
        </Container>
    );
};

export default Categories;

