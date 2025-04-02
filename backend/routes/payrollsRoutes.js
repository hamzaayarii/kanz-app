const express = require('express');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Business = require('../models/Business');
const { authenticate, authorizeBusinessOwner } = require('../middlewares/authMiddleware');
require('dotenv').config();

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

// Validation des données de fiche de paie
const validatePayrollInput = (req, res, next) => {
    const { employeeId, period } = req.body;

    if (!employeeId || !period) {
        return res.status(400).json({ message: 'Employee ID and period are required' });
    }

    const periodDate = new Date(period);
    if (isNaN(periodDate.getTime())) {
        return res.status(400).json({ message: 'Period must be a valid date' });
    }

    next();
};

// 📌 Générer une fiche de paie
router.post('/generate', authenticate, authorizeBusinessOwner, validatePayrollInput, asyncHandler(async (req, res) => {
    const { employeeId, period } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    // Vérifier que l'utilisateur a accès à la société de l'employé
    const business = await Business.findOne({ _id: employee.businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Business not found or not authorized' });
    }

    // Calcul des charges sociales (CNSS) et de l'IRPP (simplifié)
    const grossSalary = employee.salary;
    const cnssRate = 0.0918; // Taux CNSS employé (9.18%)
    const cnssContribution = grossSalary * cnssRate;
    const irppRate = 0.15; // Taux IRPP simplifié (15%)
    const irpp = (grossSalary - cnssContribution) * irppRate;
    const netSalary = grossSalary - cnssContribution - irpp;

    const payroll = new Payroll({
        employeeId,
        businessId: employee.businessId,
        period: new Date(period),
        grossSalary,
        cnssContribution,
        irpp,
        netSalary,
        createdAt: new Date()
    });

    await payroll.save();
    res.status(201).json({ message: 'Payroll generated successfully', payroll });
}));

// 📌 Récupérer toutes les fiches de paie de l'utilisateur
router.get('/', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const businessIds = await Business.find({ owner: req.user.id }).select('_id');
    const payrolls = await Payroll.find({ businessId: { $in: businessIds } })
        .populate('employeeId', 'firstName lastName')
        .sort({ period: -1 });
    res.status(200).json({ payrolls });
}));

// 📌 Récupérer une fiche de paie par ID
router.get('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const payroll = await Payroll.findById(req.params.id)
        .populate('employeeId', 'firstName lastName')
        .populate('businessId', 'name');
    if (!payroll) {
        return res.status(404).json({ message: 'Payroll not found' });
    }

    const business = await Business.findOne({ _id: payroll.businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ payroll });
}));

// 📌 Mettre à jour une fiche de paie
router.put('/:id', authenticate, authorizeBusinessOwner, validatePayrollInput, asyncHandler(async (req, res) => {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
        return res.status(404).json({ message: 'Payroll not found' });
    }

    const business = await Business.findOne({ _id: payroll.businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
    ).populate('employeeId', 'firstName lastName');

    res.status(200).json({ message: 'Payroll updated successfully', payroll: updatedPayroll });
}));

// 📌 Supprimer une fiche de paie
router.delete('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
        return res.status(404).json({ message: 'Payroll not found' });
    }

    const business = await Business.findOne({ _id: payroll.businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await Payroll.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Payroll deleted successfully' });
}));

// 📌 Générer une déclaration CNSS
router.post('/declare-cnss', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const { period } = req.body;

    if (!period) {
        return res.status(400).json({ message: 'Period is required (format: YYYY-MM)' });
    }

    const startDate = new Date(`${period}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const businessIds = await Business.find({ owner: req.user.id }).select('_id');
    const payrolls = await Payroll.find({
        businessId: { $in: businessIds },
        period: { $gte: startDate, $lt: endDate }
    }).populate('employeeId', 'firstName lastName');

    if (payrolls.length === 0) {
        return res.status(404).json({ message: 'No payrolls found for this period' });
    }

    // Calculer le total des contributions CNSS
    const totalCnss = payrolls.reduce((sum, payroll) => sum + payroll.cnssContribution, 0);

    // Générer un rapport CNSS (simplifié)
    const cnssDeclaration = {
        period,
        businessIds: businessIds.map(b => b._id),
        totalCnss,
        employees: payrolls.map(payroll => ({
            employeeId: payroll.employeeId._id,
            employeeName: `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}`,
            grossSalary: payroll.grossSalary,
            cnssContribution: payroll.cnssContribution
        }))
    };

    res.status(200).json({ message: 'CNSS declaration generated successfully', declaration: cnssDeclaration });
}));

module.exports = router;