const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

// Add a new purchase
router.post('/', async (req, res) => {
    const { product, quantity, price } = req.body;
    if (!product || !quantity || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const purchase = new Purchase({ product, quantity, price });
        await purchase.save();
        res.status(201).json(purchase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all purchases (for testing purposes)
router.get('/', async (req, res) => {
    try {
        const purchases = await Purchase.find();
        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
