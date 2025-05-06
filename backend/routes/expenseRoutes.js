const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const {authenticate, authorizeBusinessOwner} = require("../middlewares/authMiddleware");
const DailyRevenue = require("../models/DailyRevenue");
const TaxReport = require("../models/TaxReport");
const Business = require("../models/Business");
const PDFDocument = require('pdfkit');
const formatCurrency = (amount) => `${amount.toFixed(3)} $`;
const formatDate = (date) => new Intl.DateTimeFormat('fr-TN', { dateStyle: 'medium' }).format(date);

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

router.get('/generate-expense-report', authenticate, async (req, res) => {
        const userId = req.user._id || req.user.id;
        const { businessId } = req.query;

        try {
            if (!businessId) return res.status(400).json({message: "Business ID is required."});

            const business = await Business.findById({_id: businessId});
            if (!business) return res.status(404).json({message: 'Business not found'});

            // Fetch data
            const fixedExpenses = await Expense.find({business: businessId});
            const dailyExpenses = await DailyRevenue.find({business: businessId});
            const taxReports = await TaxReport.find({userId});

            // Totals
            const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
            const totalDaily = dailyExpenses.reduce((sum, d) => sum + (d.summary?.totalExpenses || 0), 0);
            const totalDeclared = taxReports.reduce((sum, r) => sum + (r.expenses || 0), 0);
            const totalAll = totalFixed + totalDaily + totalDeclared;

            // Generate PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=expense-report.pdf');
            doc.pipe(res);

            // Header
            doc.font('Helvetica-Bold').fontSize(16).text('Expense Report', {align: 'center'});
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12)
                .text(`Company: ${business.name}`, {align: 'center'})
                .text(`Tax ID: ${business.taxNumber || 'N/A'}`, {align: 'center'})
                .text(`Generated on: ${formatDate(new Date())}`, {align: 'center'});
            doc.moveDown(2);

            // Section: Breakdown
            doc.font('Helvetica-Bold').fontSize(14).text('Expense Breakdown', {underline: true});
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12)
                .text(`Fixed Charges (manual expenses): ${formatCurrency(totalFixed)}`)
                .text(`Variable Costs (daily revenue): ${formatCurrency(totalDaily)}`)
                .text(`Declared Expenses (tax reports): ${formatCurrency(totalDeclared)}`);
            doc.moveDown(1);

            // Section: Total
            doc.font('Helvetica-Bold').fontSize(12)
                .text(`Total Expenses: ${formatCurrency(totalAll)}`);
            doc.moveDown(2);

            // Optional: Table of fixed expenses by category
            doc.font('Helvetica-Bold').fontSize(14).text('Detailed Fixed Expenses', {underline: true});
            doc.moveDown(0.5);
            const grouped = {};
            fixedExpenses.forEach(e => {
                const cat = e.category.name || 'Uncategorized';
                grouped[cat] = (grouped[cat] || 0) + e.amount;
            });
            Object.entries(grouped).forEach(([cat, amt]) => {
                doc.font('Helvetica').fontSize(12).text(`${cat}: ${formatCurrency(amt)}`);
            });

            doc.moveDown(2);
            doc.font('Helvetica').fontSize(10)
                .text('Compliant with Tunisian Accounting Standards (NCT)', {align: 'center'});

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({message: 'Failed to generate report'});
        }
    }
);

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
