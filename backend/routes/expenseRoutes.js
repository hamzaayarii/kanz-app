const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Create an expense
router.post('/', async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all expenses or filter by business
router.get('/', async (req, res) => {
    const { business } = req.query;
    try {
        const query = business ? { business } : {};
        const expenses = await Expense.find(query);
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single expense
router.get('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an expense
router.put('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
