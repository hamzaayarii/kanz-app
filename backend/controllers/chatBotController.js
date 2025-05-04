const retrievalService = require('../services/retrievalService');

/**
 * Process a chat message with RAG
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processMessage(req, res) {
  try {
    const { message, userContext } = req.body;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!userContext || !userContext.role || !userContext.businessName || !userContext.businessId) {
      return res.status(400).json({ error: 'User context is incomplete. Required: role, businessName, businessId' });
    }
    
    // Generate response using RAG
    const response = await retrievalService.generateResponse(message, userContext);
    
    res.json({ reply: response });
  } catch (error) {
    console.error('Error in processMessage:', error);
    res.status(500).json({ error: 'Failed to process message: ' + error.message });
  }
}

module.exports = {
  processMessage
};