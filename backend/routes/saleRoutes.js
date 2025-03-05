const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const mongoose = require('mongoose');

// Add a new sale
router.post('/', async (req, res) => {
    const { product, quantity, price } = req.body;
    if (!product || !quantity || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const sale = new Sale({ product, quantity, price });
        await sale.save();
        res.status(201).json(sale);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all sales (for testing purposes)
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find();
        res.json(sales);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;