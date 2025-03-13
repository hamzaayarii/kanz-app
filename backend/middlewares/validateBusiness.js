const { check, validationResult } = require('express-validator');

const validateBusiness = [
  check('businessName').notEmpty().withMessage('Business Name is required'),
  check('typeOfActivity').notEmpty().withMessage('Type of Activity is required'),
  check('taxRegistrationNumber').notEmpty().withMessage('Tax Registration Number is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  check('email').isEmail().withMessage('Invalid email').notEmpty().withMessage('Email is required'),
  check('companyWebsite').optional().isURL().withMessage('Invalid URL'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateBusiness;