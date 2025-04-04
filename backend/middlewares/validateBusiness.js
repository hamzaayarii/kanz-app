const { check, validationResult } = require('express-validator');

// Validation patterns (shared with frontend)
const validationPatterns = {
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,  // Phone number validation
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Email validation
    taxNumber: /^\d{8}[A-Z](\/[A-Z])?\/\d{3}$/, // Format like 12345678A/M/000
    rneNumber: /^\d{11}$/ // Keep this the same
};

// Express-validator rules
const validateBusiness = [
    check('businessName')
        .notEmpty().withMessage('Business Name is required')
        .isLength({ min: 3 }).withMessage('Business Name must be at least 3 characters'),
    check('typeOfActivity').notEmpty().withMessage('Type of Activity is required'),
    check('taxRegistrationNumber')
    .notEmpty().withMessage('Matricule Fiscal is required')
    .matches(/^\d{7}[A-Z]$/).withMessage('Tax number should be 7 digits followed by a capital letter (e.g., 1234567A)'),
  check('rneNumber')
        .notEmpty().withMessage('RNE Number is required')
        .matches(validationPatterns.rneNumber).withMessage('RNE must be exactly 11 digits'),
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