const express = require('express');
const TaxReport = require('../models/TaxReport');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware de gestion d'erreurs async
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(err.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

// Validation des entrées
const validateTaxInput = (req, res, next) => {
    const { income, expenses, year } = req.body;

    if (!income || !expenses || !year) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (income < 0 || expenses < 0) {
        return res.status(400).json({ message: 'Income and expenses must be positive numbers' });
    }

    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear) {
        return res.status(400).json({ message: 'Invalid year' });
    }

    next();
};

// Calcul de la taxe selon la loi tunisienne
const calculateTax = (income, expenses) => {
    const taxableIncome = income - expenses;
    let calculatedTax = 0;

    if (taxableIncome <= 5000) {
        calculatedTax = 0;
    } else if (taxableIncome <= 20000) {
        calculatedTax = (taxableIncome - 5000) * 0.26;
    } else if (taxableIncome <= 30000) {
        calculatedTax = (15000 * 0.26) + (taxableIncome - 20000) * 0.28;
    } else if (taxableIncome <= 50000) {
        calculatedTax = (15000 * 0.26) + (10000 * 0.28) + (taxableIncome - 30000) * 0.32;
    } else {
        calculatedTax = (15000 * 0.26) + (10000 * 0.28) + (20000 * 0.32) + (taxableIncome - 50000) * 0.35;
    }

    return calculatedTax;
};

// Générer un rapport fiscal
router.post('/generate', authenticate, validateTaxInput, asyncHandler(async (req, res) => {
    const { income, expenses, year } = req.body;

    const calculatedTax = calculateTax(income, expenses);

    const taxReport = new TaxReport({
        userId: req.user.id,
        year,
        income,
        expenses,
        calculatedTax,
    });

    try {
        await taxReport.save();
        res.status(201).json({ message: 'Tax report generated successfully', taxReport });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Tax report for this year already exists' });
        }
        throw err;
    }
}));

// Récupérer les rapports fiscaux
router.get('/reports', authenticate, asyncHandler(async (req, res) => {
    const reports = await TaxReport.find({ userId: req.user.id })
        .sort({ year: -1 }); // Tri par année décroissante
    res.json({ reports });
}));

// Mettre à jour un rapport fiscal
router.put('/update/:id', authenticate, validateTaxInput, asyncHandler(async (req, res) => {
    const { income, expenses, year } = req.body;
    const { id } = req.params;

    const taxReport = await TaxReport.findById(id);
    if (!taxReport) {
        return res.status(404).json({ message: 'Tax report not found' });
    }

    if (taxReport.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const calculatedTax = calculateTax(income, expenses);
    taxReport.income = income;
    taxReport.expenses = expenses;
    taxReport.year = year;
    taxReport.calculatedTax = calculatedTax;

    await taxReport.save();
    res.json({ message: 'Tax report updated successfully', taxReport });
}));

// Supprimer un rapport fiscal
router.delete('/delete/:id', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;

    const taxReport = await TaxReport.findById(id);
    if (!taxReport) {
        return res.status(404).json({ message: 'Tax report not found' });
    }

    if (taxReport.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    await TaxReport.findByIdAndDelete(id);
    res.json({ message: 'Tax report deleted successfully' });
}));

module.exports = router;