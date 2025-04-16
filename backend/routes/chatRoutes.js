const express = require('express');
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation, 
  deleteConversation,
  getLatestMessages
}=require('../controllers/chatController');
const { authenticate }=require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/messages/:conversationId', authenticate, getMessages);
router.post('/messages', authenticate, sendMessage);
router.post('/conversations', authenticate, createConversation);
router.delete('/conversations/:conversationId', authenticate, deleteConversation);
router.get('/latest-messages', authenticate, getLatestMessages); 
module.exports = router;