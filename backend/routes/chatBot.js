const express = require("express");
const router = express.Router();
const cohere = require("../middlewares/cohereClient");

router.post("/ask", async (req, res) => {
  const { message, userContext } = req.body;
  try {
    const prompt = `
      You are an AI assistant capable of answering questions about accounting, taxation, and legal matters. 
      The user is a business owner or an accountant seeking guidance in these areas.
      
      User role: ${userContext.role}, Business: ${userContext.businessName}
      User's question: ${message}
      
      Provide accurate, helpful, and legally correct responses related to accounting, taxes, and legal advice.
      
      Answer:
    `;
    
    // Call the generate method with the updated client
    const response = await cohere.generate({
      model: "command",  // or "command-r" based on your preference
      prompt: prompt,
      maxTokens: 300,
      temperature: 0.7,
    });

    // Extract the bot's reply from the response object
    const botReply = response.generations[0].text.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Cohere error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;