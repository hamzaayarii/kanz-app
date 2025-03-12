const express = require('express');
const router = express.Router();
const { addBusiness, getUserBusinesses, checkUserBusiness } = require('../controllers/businessController');
const { authenticate, authorizeBusinessOwner, authorizeAccountant } = require('../middlewares/authMiddleware');
const Business = require('../models/Business');

// Apply authentication middleware to all business routes
router.use(authenticate);

// Business routes
router.post('/register', authorizeBusinessOwner, addBusiness); // Only business owners can add businesses

router.get('/buisnessowner', authorizeBusinessOwner, getUserBusinesses); // Only business owners can list his businesses

router.get('/check', checkUserBusiness);

module.exports = router;