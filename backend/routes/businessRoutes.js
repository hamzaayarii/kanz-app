const express = require('express');
const router = express.Router();
const { addBusiness, getUserBusinesses } = require('../controllers/businessController');
const { authenticate, authorizeBusinessOwner, authorizeAccountant } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all business routes
router.use(authenticate);

// Business routes
router.post('/', authorizeBusinessOwner, addBusiness); // Only business owners can add businesses
router.get('/user', authorizeAccountant, getUserBusinesses); // Only accountants can get user businesses

module.exports = router;