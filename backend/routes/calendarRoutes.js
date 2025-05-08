const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticate } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get calendar data (aggregated expenses and revenues by date)
router.get('/data', calendarController.getCalendarData);

// Get detailed data for a specific day
router.get('/day-details', calendarController.getDayDetails);

module.exports = router;