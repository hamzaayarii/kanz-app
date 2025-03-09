import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, FormGroup, Label, Input, Alert, Table } from 'reactstrap';

const Items = () => {
    const [item, setItem] = useState({
        type: 'Goods',
        name: '',
        unit: '',
        salesInfo: { sellingPrice: '', description: '', tax: '' },
        purchaseInfo: { costPrice: '', description: '', tax: '' }
    });
    const [message, setMessage] = useState('');
    const [itemsList, setItemsList] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false); // Flag for edit mode
    const [currentItemId, setCurrentItemId] = useState(null); // Store the ID of the item being edited

    useEffect(() => {
        // Fonction pour récupérer les items au chargement de la page
        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setItemsList(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, [message]); // Relancer la récupération après l'ajout d'un item

    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setItem(prevState => ({
                ...prevState,
                [keys[0]]: {
                    ...prevState[keys[0]],
                    [keys[1]]: value
                }
            }));
        } else {
            setItem(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Si en mode édition, on met à jour l'item
                await axios.put(`http://localhost:5000/api/products/${currentItemId}`, item);
                setMessage('Item updated successfully!');
            } else {
                // Sinon, on ajoute un nouvel item
                await axios.post('http://localhost:5000/api/products', item);
                setMessage('Item added successfully!');
            }
    
            // Réinitialiser le formulaire après soumission
            setItem({
                type: 'Goods',
                name: '',
                unit: '',
                salesInfo: { sellingPrice: '', description: '', tax: '' },
                purchaseInfo: { costPrice: '', description: '', tax: '' }
            });
            setIsEditMode(false); // Désactiver le mode édition
            setCurrentItemId(null); // Réinitialiser l'ID
            
            // Relancer la récupération des items pour actualiser la liste
            const fetchItems = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/products');
                    setItemsList(response.data);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            };
            fetchItems(); // Recharger les items
        } catch (error) {
            setMessage('Failed to add/update item.');
        }
    };

    const handleEdit = (itemId) => {
        // Charger les données de l'item sélectionné dans le formulaire
        const selectedItem = itemsList.find(i => i._id === itemId);
        setItem(selectedItem);
        setIsEditMode(true); // Passer en mode édition
        setCurrentItemId(itemId); // Stocker l'ID de l'item en édition
    };

    const handleDelete = async (itemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${itemId}`);
            setMessage('Item deleted successfully!');
        } catch (error) {
            setMessage('Failed to delete item.');
        }
    };

    return (
        <div className="container mt-4">
            <h2>{isEditMode ? 'Edit Item' : 'Add New Item'}</h2>
            {message && <Alert color="info">{message}</Alert>}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>Type</Label>
                    <Input type="select" name="type" value={item.type} onChange={handleChange}>
                        <option value="Goods">Goods</option>
                        <option value="Service">Service</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label>Name</Label>
                    <Input type="text" name="name" value={item.name} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label>Unit</Label>
                    <Input type="text" name="unit" value={item.unit} onChange={handleChange} required />
                </FormGroup>

                <h4>Sales Information</h4>
                <FormGroup>
                    <Label>Selling Price</Label>
                    <Input type="number" name="salesInfo.sellingPrice" value={item.salesInfo.sellingPrice} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label>Description</Label>
                    <Input type="text" name="salesInfo.description" value={item.salesInfo.description} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>Tax</Label>
                    <Input type="number" name="salesInfo.tax" value={item.salesInfo.tax} onChange={handleChange} />
                </FormGroup>

                <h4>Purchase Information</h4>
                <FormGroup>
                    <Label>Cost Price</Label>
                    <Input type="number" name="purchaseInfo.costPrice" value={item.purchaseInfo.costPrice} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label>Description</Label>
                    <Input type="text" name="purchaseInfo.description" value={item.purchaseInfo.description} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>Tax</Label>
                    <Input type="number" name="purchaseInfo.tax" value={item.purchaseInfo.tax} onChange={handleChange} />
                </FormGroup>

                <Button color="primary" type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</Button>
            </Form>

            <h2 className="mt-4">Items List</h2>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Unit</th>
                        <th>Sales Price</th>
                        <th>Cost Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsList.map((item, index) => (
                        <tr key={index}>
                            <td>{item.type}</td>
                            <td>{item.name}</td>
                            <td>{item.unit}</td>
                            <td>{item.salesInfo.sellingPrice}</td>
                            <td>{item.purchaseInfo.costPrice}</td>
                            <td>
                                <Button color="warning" onClick={() => handleEdit(item._id)}>Edit</Button>{' '}
                                <Button color="danger" onClick={() => handleDelete(item._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Items;
