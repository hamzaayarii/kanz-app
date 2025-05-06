const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const {authenticate, authorizeBusinessOwner} = require("../middlewares/authMiddleware");
const DailyRevenue = require("../models/DailyRevenue");
const TaxReport = require("../models/TaxReport");

// Create an expense
router.post('/', authenticate, authorizeBusinessOwner,async (req, res) => {
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
router.get('/', authenticate, async (req, res) => {
    const { business } = req.query;
    try {
        const query = business ? { business } : {};
        const expenses = await Expense.find(query);
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/daily-expenses', authenticate, async (req, res) => {
    const { business } = req.query;
    try {
        const query = business ? { business } : {};
        const expenses = await DailyRevenue.find(query);
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/taxreport-expenses', authenticate, async (req, res) => {
    const userId = req.user._id || req.user.id;
    try {
        const taxreports = await TaxReport.find({ userId });
        res.json(taxreports);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/total-expenses', authenticate, async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { business } = req.query;
    try {
        const taxreports = await TaxReport.find({ userId });
        const taxtotalExpenses = taxreports.reduce((acc, curr) => acc + curr.expenses, 0);
        const query = business ? { business } : {};
        const expenses = await Expense.find(query);
        const normaltotalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const dailyexpenses = await DailyRevenue.find(query);
        const dailytotalExpenses = dailyexpenses.reduce((acc, curr) => acc + curr.summary.totalExpenses, 0);
        const totalExpenses = dailytotalExpenses + normaltotalExpenses + taxtotalExpenses;
        res.json({normaltotalExpenses, taxtotalExpenses, dailytotalExpenses, totalExpenses});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single expense
router.get('/:id', authenticate,async (req, res) => {
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
router.put('/:id', authenticate, authorizeBusinessOwner,async (req, res) => {
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
router.delete('/:id', authenticate, authorizeBusinessOwner,async (req, res) => {
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
