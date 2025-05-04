const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatBotController');

// Chat routes
router.post('/ask', chatController.processMessage);

module.exports = router;