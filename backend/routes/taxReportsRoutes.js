const express = require('express');
const TaxReport = require('../models/TaxReport');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

// Helper function to calculate tax based on the updated Tunisian law
const calculateTax = (income, expenses) => {
    const taxableIncome = income - expenses;
    let calculatedTax = 0;

    // Tax calculation based on the provided tax brackets
    if (taxableIncome <= 5000) {
        // No tax for income up to 5,000 TND
        calculatedTax = 0;
    } else if (taxableIncome <= 20000) {
        // Tax from 5,001 to 20,000 TND: 26%
        calculatedTax = (taxableIncome - 5000) * 0.26;
    } else if (taxableIncome <= 30000) {
        // Tax from 20,001 to 30,000 TND: 28%
        calculatedTax = (15000 * 0.26) + (taxableIncome - 20000) * 0.28;
    } else if (taxableIncome <= 50000) {
        // Tax from 30,001 to 50,000 TND: 32%
        calculatedTax = (15000 * 0.26) + (10000 * 0.28) + (taxableIncome - 30000) * 0.32;
    } else {
        // Tax above 50,000 TND: 35%
        calculatedTax = (15000 * 0.26) + (10000 * 0.28) + (20000 * 0.32) + (taxableIncome - 50000) * 0.35;
    }

    return calculatedTax;
};

// Route to generate a tax report
router.post('/generate', authenticate, async (req, res) => {
    const { income, expenses, year, taxRate } = req.body;

    if (!income || !expenses || !year || !taxRate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Calculate tax based on the provided income, expenses, and tax rate
        const taxableIncome = income - expenses;
        const calculatedTax = taxableIncome * taxRate;

        // Create and save the tax report
        const taxReport = new TaxReport({
            userId: req.user.id,
            year,
            income,
            expenses,
            taxRate,
            calculatedTax,
        });

        await taxReport.save();
        res.status(201).json({ message: 'Tax report generated successfully', taxReport });
    } catch (err) {
        console.error('Error generating tax report:', err);
        res.status(500).json({ message: 'Error generating tax report' });
    }
});

// Route to fetch tax reports for the authenticated user
router.get('/reports', authenticate, async (req, res) => {
    try {
        const reports = await TaxReport.find({ userId: req.user.id });  // Fetch reports for the authenticated user
        res.json({ reports });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error fetching tax reports' });
    }
});

// Route to update a tax report
router.put('/update/:id', authenticate, async (req, res) => {
    const { income, expenses, year } = req.body;
    const { id } = req.params;

    if (!income || !expenses || !year) {
        return res.status(400).json({ message: 'All fields (income, expenses, year) are required.' });
    }

    try {
        // Find the tax report by ID and check if it belongs to the authenticated user
        const taxReport = await TaxReport.findById(id);
        if (!taxReport) {
            return res.status(404).json({ message: 'Tax report not found' });
        }

        // Ensure the report belongs to the authenticated user
        if (taxReport.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to update this report' });
        }

        // Calculate the new tax based on the updated data
        const calculatedTax = calculateTax(income, expenses);

        // Update the tax report with the new values
        taxReport.income = income;
        taxReport.expenses = expenses;
        taxReport.year = year;
        taxReport.calculatedTax = calculatedTax;

        // Save the updated report
        await taxReport.save();
        res.json({ message: 'Tax report updated successfully', taxReport });
    } catch (err) {
        console.error('Error updating tax report:', err);
        res.status(500).json({ message: 'Error updating tax report' });
    }
});

// Route to delete a tax report
router.delete('/delete/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        // Find the tax report by ID and check if it belongs to the authenticated user
        const taxReport = await TaxReport.findById(id);
        if (!taxReport) {
            return res.status(404).json({ message: 'Tax report not found' });
        }

        // Ensure the report belongs to the authenticated user
        if (taxReport.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this report' });
        }

        // Delete the tax report
        await TaxReport.findByIdAndDelete(id);
        res.json({ message: 'Tax report deleted successfully' });
    } catch (err) {
        console.error('Error deleting tax report:', err);
        res.status(500).json({ message: 'Error deleting tax report' });
    }
});

module.exports = router;
