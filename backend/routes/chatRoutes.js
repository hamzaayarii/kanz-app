const express = require('express');
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation 
}=require('../controllers/chatController');
const { authenticate }=require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/messages/:conversationId', authenticate, getMessages);
router.post('/messages', authenticate, sendMessage);
router.post('/conversations', authenticate, createConversation);

module.exports = router;