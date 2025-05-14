const express = require('express');
const TaxReport = require('../models/TaxReport');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(err.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

const validateTaxInput = (req, res, next) => {
    const { income, expenses, year } = req.body;

    if (!Number.isFinite(Number(income)) || !Number.isFinite(Number(expenses)) || !Number.isFinite(Number(year))) {
        return res.status(400).json({ message: 'Income, expenses, and year must be numbers' });
    }

    if (income < 0 || expenses < 0) {
        return res.status(400).json({ message: 'Income and expenses must be positive numbers' });
    }

    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear) {
        return res.status(400).json({ message: `Year must be between 2000 and ${currentYear} `});
    }

    next();
};

const calculateTax = (income, expenses) => {
    const parsedIncome = Number(income);
    const parsedExpenses = Number(expenses);
    if (isNaN(parsedIncome) || isNaN(parsedExpenses)) {
        throw new Error('Income and expenses must be valid numbers');
    }

    const taxableIncome = Math.max(0, parsedIncome - parsedExpenses);
    let calculatedTax = 0;

    if (taxableIncome <= 5000) {
        calculatedTax = 0;
    } else if (taxableIncome <= 10000) {
        calculatedTax = (taxableIncome - 5000) * 0.15;
    } else if (taxableIncome <= 20000) {
        calculatedTax = (5000 * 0.15) + (taxableIncome - 10000) * 0.20;
    } else if (taxableIncome <= 30000) {
        calculatedTax = (5000 * 0.15) + (10000 * 0.20) + (taxableIncome - 20000) * 0.25;
    } else if (taxableIncome <= 40000) {
        calculatedTax = (5000 * 0.15) + (10000 * 0.20) + (10000 * 0.25) + (taxableIncome - 30000) * 0.30;
    } else if (taxableIncome <= 50000) {
        calculatedTax = (5000 * 0.15) + (10000 * 0.20) + (10000 * 0.25) + (10000 * 0.30) + (taxableIncome - 40000) * 0.35;
    } else if (taxableIncome <= 60000) {
        calculatedTax = (5000 * 0.15) + (10000 * 0.20) + (10000 * 0.25) + (10000 * 0.30) + (10000 * 0.35) + (taxableIncome - 50000) * 0.37;
    } else {
        calculatedTax = (5000 * 0.15) + (10000 * 0.20) + (10000 * 0.25) + (10000 * 0.30) + (10000 * 0.35) + (10000 * 0.37) + (taxableIncome - 60000) * 0.40;
    }

    return Number(calculatedTax.toFixed(2));
};

router.post('/generate',
    authenticate,
    validateTaxInput,
    asyncHandler(async (req, res) => {
        const {  businessId, income, expenses, year } = req.body;

        const existingReport = await TaxReport.findOne({ business: businessId, year });
        if (existingReport) {
            return res.status(400).json({ message: 'Tax report for this year already exists' });
        }

        const calculatedTax = calculateTax(income, expenses);

        const taxReport = new TaxReport({
            business: businessId,
            year,
            income,
            expenses,
            calculatedTax,
            createdAt: new Date()
        });

        const savedReport = await taxReport.save();
        res.status(201).json({
            message: 'Tax report generated successfully',
            taxReport: savedReport
        });
    })
);

router.get('/reports',
    authenticate,
    asyncHandler(async (req, res) => {
        const reports = await TaxReport.find({ business: req.query.businessId })
            .sort({ year: -1 });
        res.status(200).json({
            success: true,
            reports
        });
    })
);

router.put('/update/:id',
    authenticate,
    validateTaxInput,
    asyncHandler(async (req, res) => {
        const { income, expenses, year } = req.body;
        const { id } = req.params;

        const taxReport = await TaxReport.findById(id);
        if (!taxReport) {
            return res.status(404).json({ message: 'Tax report not found' });
        }

        if (taxReport.userId.toString() !== (req.user._id || req.user.id).toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const duplicateReport = await TaxReport.findOne({
            business: req.query.businessId,
            year,
            _id: { $ne: id }
        });
        if (duplicateReport) {
            return res.status(400).json({ message: 'A tax report for this year already exists' });
        }

        taxReport.income = Number(income);
        taxReport.expenses = Number(expenses);
        taxReport.year = year;
        taxReport.calculatedTax = calculateTax(income, expenses);
        taxReport.updatedAt = new Date();

        const updatedReport = await taxReport.save();
        res.status(200).json({
            message: 'Tax report updated successfully',
            taxReport: updatedReport
        });
    })
);

router.delete('/delete/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        const taxReport = await TaxReport.findById(id);
        if (!taxReport) {
            return res.status(404).json({ message: 'Tax report not found' });
        }

        if (taxReport.userId.toString() !== (req.user._id || req.user.id).toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await TaxReport.findByIdAndDelete(id);
        res.status(200).json({ message: 'Tax report deleted successfully' });
    })
);

module.exports = router;
