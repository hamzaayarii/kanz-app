const express = require('express');
const Employee = require('../models/Employee');
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

// Validation des données d'employé
const validateEmployeeInput = (req, res, next) => {
    const { firstName, lastName, position, salary, hireDate, businessId } = req.body;

    if (!firstName || !lastName || !position || !salary || !hireDate || !businessId) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (salary < 0) {
        return res.status(400).json({ message: 'Salary must be positive' });
    }

    const hireDateObj = new Date(hireDate);
    if (isNaN(hireDateObj.getTime())) {
        return res.status(400).json({ message: 'Hire date must be a valid date' });
    }

    next();
};

// 📌 Ajouter un employé
router.post('/', authenticate, authorizeBusinessOwner, validateEmployeeInput, asyncHandler(async (req, res) => {
    const { firstName, lastName, position, salary, hireDate, businessId } = req.body;

    const business = await Business.findOne({ _id: businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Business not found or not authorized' });
    }

    const employee = new Employee({
        businessId,
        userId: req.user.id,
        firstName,
        lastName,
        position,
        salary,
        hireDate: new Date(hireDate),
        createdAt: new Date()
    });

    await employee.save();
    res.status(201).json({ message: 'Employee added successfully', employee });
}));

// 📌 Récupérer tous les employés de l'utilisateur
router.get('/', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const employees = await Employee.find({ userId: req.user.id })
        .populate('businessId', 'name')
        .sort({ createdAt: -1 });
    res.status(200).json({ employees });
}));

// 📌 Récupérer un employé par ID
router.get('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).populate('businessId', 'name');
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    res.status(200).json({ employee });
}));

// 📌 Mettre à jour un employé
router.put('/:id', authenticate, authorizeBusinessOwner, validateEmployeeInput, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
    ).populate('businessId', 'name');

    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
}));

// 📌 Supprimer un employé
router.delete('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
}));

// 📌 Importer des employés
router.post('/import', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ message: 'Data must be a non-empty array of employees' });
    }

    const createdEmployees = [];
    for (const employeeData of employees) {
        const { firstName, lastName, position, salary, hireDate, businessId } = employeeData;

        if (!firstName || !lastName || !position || !salary || !hireDate || !businessId) {
            continue; // Ignorer les entrées invalides
        }

        const business = await Business.findOne({ _id: businessId, owner: req.user.id });
        if (!business) {
            continue; // Ignorer si la société n'est pas autorisée
        }

        const employee = new Employee({
            businessId,
            userId: req.user.id,
            firstName,
            lastName,
            position,
            salary,
            hireDate: new Date(hireDate),
            createdAt: new Date()
        });

        await employee.save();
        createdEmployees.push(employee);
    }

    res.status(201).json({ message: 'Employees imported successfully', employees: createdEmployees });
}));

// 📌 Ajouter une absence pour un employé
const validateAbsenceInput = (req, res, next) => {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
        return res.status(400).json({ message: 'Fields startDate, endDate, and reason are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Dates must be valid' });
    }

    if (start > end) {
        return res.status(400).json({ message: 'Start date must be before end date' });
    }

    next();
};

router.post('/:id/absences', authenticate, authorizeBusinessOwner, validateAbsenceInput, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const { startDate, endDate, reason } = req.body;
    employee.absences.push({ startDate: new Date(startDate), endDate: new Date(endDate), reason });
    await employee.save();

    res.status(200).json({ message: 'Absence added successfully', employee });
}));

module.exports = router;