const express = require('express');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Business = require('../models/Business');
const { authenticate, authorizeBusinessOwner } = require('../middlewares/authMiddleware');
require('dotenv').config();

const router = express.Router();

// Async handler middleware
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(err.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

// Validation for payroll input
const validatePayrollInput = (req, res, next) => {
    const { employeeId, period } = req.body;

    if (!employeeId || !period) {
        return res.status(400).json({ message: 'Employee ID and period are required' });
    }

    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ message: 'Period must be in YYYY-MM format' });
    }

    const [year, month] = period.split('-');
    const periodDate = new Date(year, month - 1);
    if (isNaN(periodDate.getTime()) || periodDate.getMonth() !== Number(month) - 1) {
        return res.status(400).json({ message: 'Invalid period date' });
    }

    next();
};

// Generate a payroll
router.post('/generate',
    authenticate,
    authorizeBusinessOwner,
    validatePayrollInput,
    asyncHandler(async (req, res) => {
        const { employeeId, period } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const business = await Business.findOne({ _id: employee.businessId, owner: req.user._id || req.user.id });
        if (!business) {
            return res.status(403).json({ message: 'Business not found or not authorized' });
        }

        // Check if payroll already exists for this employee and period
        const existingPayroll = await Payroll.findOne({ employeeId, period });
        if (existingPayroll) {
            return res.status(400).json({ message: 'Payroll already exists for this employee and period' });
        }

        // Simplified tax calculations (CNSS and IRPP)
        const grossSalary = employee.salary;
        const cnssRate = 0.0918; // Employee CNSS rate (9.18%)
        const cnssContribution = grossSalary * cnssRate;
        const irppRate = 0.15; // Simplified IRPP rate (15%)
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

        const savedPayroll = await payroll.save();
        await savedPayroll.populate('employeeId', 'firstName lastName');

        res.status(201).json({
            message: 'Payroll generated successfully',
            payroll: savedPayroll
        });
    })
);

// Get all payrolls for the authenticated user
router.get('/',
    authenticate,
    authorizeBusinessOwner,
    asyncHandler(async (req, res) => {
        const businessIds = await Business.find({ owner: req.user._id || req.user.id }).select('_id');
        const payrolls = await Payroll.find({ businessId: { $in: businessIds } })
            .populate('employeeId', 'firstName lastName')
            .populate('businessId', 'name')
            .sort({ period: -1 });

        res.status(200).json({
            success: true,
            payrolls
        });
    })
);

// Get a specific payroll by ID
router.get('/:id',
    authenticate,
    authorizeBusinessOwner,
    asyncHandler(async (req, res) => {
        const payroll = await Payroll.findById(req.params.id)
            .populate('employeeId', 'firstName lastName')
            .populate('businessId', 'name');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }

        const business = await Business.findOne({ _id: payroll.businessId, owner: req.user._id || req.user.id });
        if (!business) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            payroll
        });
    })
);

// Update a payroll
router.put('/:id',
    authenticate,
    authorizeBusinessOwner,
    validatePayrollInput,
    asyncHandler(async (req, res) => {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }

        const business = await Business.findOne({ _id: payroll.businessId, owner: req.user._id || req.user.id });
        if (!business) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedPayroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                period: new Date(req.body.period),
                updatedAt: new Date()
            },
            { new: true }
        ).populate('employeeId', 'firstName lastName')
            .populate('businessId', 'name');

        res.status(200).json({
            message: 'Payroll updated successfully',
            payroll: updatedPayroll
        });
    })
);

// Delete a payroll
router.delete('/:id',
    authenticate,
    authorizeBusinessOwner,
    asyncHandler(async (req, res) => {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }

        const business = await Business.findOne({ _id: payroll.businessId, owner: req.user._id || req.user.id });
        if (!business) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Payroll.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Payroll deleted successfully' });
    })
);

// Generate CNSS declaration
router.post('/declare-cnss',
    authenticate,
    authorizeBusinessOwner,
    asyncHandler(async (req, res) => {
        const { period } = req.body;

        if (!period || !/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ message: 'Period is required in YYYY-MM format' });
        }

        const [year, month] = period.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const businessIds = await Business.find({ owner: req.user._id || req.user.id }).select('_id');
        const payrolls = await Payroll.find({
            businessId: { $in: businessIds },
            period: { $gte: startDate, $lt: endDate }
        }).populate('employeeId', 'firstName lastName');

        if (payrolls.length === 0) {
            return res.status(404).json({ message: 'No payrolls found for this period' });
        }

        const totalCnss = payrolls.reduce((sum, payroll) => sum + payroll.cnssContribution, 0);

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

        res.status(200).json({
            message: 'CNSS declaration generated successfully',
            declaration: cnssDeclaration
        });
    })
);

module.exports = router;