const express = require('express');
const router = express.Router();
const dailyRevenueController = require('../controllers/dailyRevenueController');
const { authenticate} = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new daily revenue entry
router.post('/', dailyRevenueController.create);

// Get all daily revenue entries
router.get('/', dailyRevenueController.list);

// Get daily revenue entries for a specific business
router.get('/business/:businessId', dailyRevenueController.getByBusiness);

// Get a single daily revenue entry
router.get('/:id', dailyRevenueController.get);

// Update a daily revenue entry
router.put('/:id', dailyRevenueController.update);

// Delete a daily revenue entry
router.delete('/:id', dailyRevenueController.delete);

// Update status of a daily revenue entry
router.patch('/:id/status', dailyRevenueController.updateStatus);

module.exports = router; 