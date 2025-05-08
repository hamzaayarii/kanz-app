const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate} = require('../middlewares/authMiddleware');

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get dashboard data for all businesses
router.get('/all', dashboardController.getAllBusinessesDashboardData);

// Get dashboard data for a specific business
router.get('/:businessId', dashboardController.getDashboardData);

module.exports = router;