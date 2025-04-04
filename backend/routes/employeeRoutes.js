const express = require('express');
const Employee = require('../models/Employee');
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

// Validation middleware for employee data
const validateEmployeeInput = (req, res, next) => {
    const { firstName, lastName, position, salary, hireDate, businessId } = req.body;
    if (!firstName?.trim() || !lastName?.trim() || !position?.trim() || !salary || !hireDate || !businessId) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (!Number.isFinite(Number(salary)) || Number(salary) < 0) {
        return res.status(400).json({ message: 'Salary must be a positive number' });
    }
    const hireDateObj = new Date(hireDate);
    if (isNaN(hireDateObj.getTime())) {
        return res.status(400).json({ message: 'Hire date must be a valid date' });
    }
    next();
};

// Validation for absence input
const validateAbsenceInput = (req, res, next) => {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason?.trim()) {
        return res.status(400).json({ message: 'Fields startDate, endDate, and reason are required' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Dates must be valid' });
    }
    if (start > end) {
        return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }
    next();
};

// Add an employee
router.post('/', authenticate, authorizeBusinessOwner, validateEmployeeInput, asyncHandler(async (req, res) => {
    const { firstName, lastName, position, salary, hireDate, businessId } = req.body;
    const business = await Business.findOne({ _id: businessId, owner: req.user._id || req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Business not found or not authorized' });
    }
    const employee = new Employee({
        businessId,
        userId: req.user._id || req.user.id,
        firstName,
        lastName,
        position,
        salary: Number(salary),
        hireDate: new Date(hireDate),
    });
    const savedEmployee = await employee.save();
    const populatedEmployee = await Employee.findById(savedEmployee._id).populate('businessId', 'name');
    res.status(201).json({ message: 'Employee added successfully', employee: populatedEmployee });
}));

// Get all employees
router.get('/', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const employees = await Employee.find({ userId }).populate('businessId', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, employees });
}));

// Get a specific employee
router.get('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).populate('businessId', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.userId.toString() !== (req.user._id || req.user.id).toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    res.status(200).json({ success: true, employee });
}));

// Update an employee
router.put('/:id', authenticate, authorizeBusinessOwner, validateEmployeeInput, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.userId.toString() !== (req.user._id || req.user.id).toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.id,
        { ...req.body, salary: Number(req.body.salary), hireDate: new Date(req.body.hireDate) },
        { new: true }
    ).populate('businessId', 'name');
    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
}));

// Delete an employee
router.delete('/:id', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.userId.toString() !== (req.user._id || req.user.id).toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
}));

// Import employees
router.post('/import', authenticate, authorizeBusinessOwner, asyncHandler(async (req, res) => {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ message: 'Data must be a non-empty array of employees' });
    }
    const userId = req.user._id || req.user.id;
    const createdEmployees = [];
    for (const employeeData of employees) {
        const { firstName, lastName, position, salary, hireDate, businessId } = employeeData;
        if (!firstName?.trim() || !lastName?.trim() || !position?.trim() || !salary || !hireDate || !businessId) continue;
        const business = await Business.findOne({ _id: businessId, owner: userId });
        if (!business) continue;
        const employee = new Employee({
            businessId,
            userId,
            firstName,
            lastName,
            position,
            salary: Number(salary),
            hireDate: new Date(hireDate),
        });
        const savedEmployee = await employee.save();
        const populatedEmployee = await Employee.findById(savedEmployee._id).populate('businessId', 'name');
        createdEmployees.push(populatedEmployee);
    }
    res.status(201).json({ message: 'Employees imported successfully', employees: createdEmployees });
}));

// Add an absence
router.post('/:id/absences', authenticate, authorizeBusinessOwner, validateAbsenceInput, asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.userId.toString() !== (req.user._id || req.user.id).toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    const { startDate, endDate, reason } = req.body;
    employee.absences = employee.absences || [];
    employee.absences.push({ startDate: new Date(startDate), endDate: new Date(endDate), reason });
    const updatedEmployee = await employee.save();
    await updatedEmployee.populate('businessId', 'name');
    res.status(200).json({ message: 'Absence added successfully', employee: updatedEmployee });
}));

module.exports = router;