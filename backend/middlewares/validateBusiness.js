const { check, validationResult } = require('express-validator');

// Validation patterns (shared with frontend)
const validationPatterns = {
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,  // Phone number validation
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Email validation
    taxNumber: /^\d{8}[A-Z](\/M\/\d{3})?$/, // 8 digits + letter, optional /M/000 suffix
    rneNumber: /^[A-Z]\d{7,10}$/ // Letter followed by 7-10 digits
};

// Express-validator rules
const validateBusiness = [
    check('businessName')
        .notEmpty().withMessage('Business Name is required')
        .isLength({ min: 3 }).withMessage('Business Name must be at least 3 characters'),
    check('typeOfActivity').notEmpty().withMessage('Type of Activity is required'),
    check('taxRegistrationNumber')
    .notEmpty().withMessage('Matricule Fiscal is required')
    .matches(validationPatterns.taxNumber)
    .withMessage('Tax number should be 8 digits followed by a capital letter (e.g., 12345678A or 12345678A/M/000)'),
check('rneNumber')
    .notEmpty().withMessage('RNE Number is required')
    .matches(validationPatterns.rneNumber)
    .withMessage('RNE must start with a letter (A/B/C/D) followed by 7-10 digits (e.g., B12345678)'),
     check('address')
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    check('phoneNumber')
        .notEmpty().withMessage('Phone Number is required')
        .matches(validationPatterns.phone).withMessage('Please enter a valid phone number'),
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(validationPatterns.email).withMessage('Please enter a valid email address'),
    check('companyWebsite').optional().isURL().withMessage('Invalid URL'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateBusiness;