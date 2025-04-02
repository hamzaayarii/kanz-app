const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const auth = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all journal entries with pagination and filters
router.get('/', journalController.getEntries);

// Create new journal entry
router.post('/', journalController.createEntry);

// Get journal entry by ID
router.get('/:id', journalController.getEntry);

// Update journal entry
router.put('/:id', journalController.updateEntry);

// Delete journal entry
router.delete('/:id', journalController.deleteEntry);

// Update entry status
router.patch('/:id/status', journalController.updateStatus);

module.exports = router; 