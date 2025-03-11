const express = require('express');
const router = express.Router();
const { addBusiness, getUserBusinesses } = require('../controllers/businessController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have this middleware

// Apply auth middleware to all business routes
router.use(authMiddleware);

// Business routes
router.post('/', addBusiness);
router.get('/user', getUserBusinesses);

module.exports = router;