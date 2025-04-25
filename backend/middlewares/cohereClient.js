const { CohereClient } = require("cohere-ai");

// Create a new Cohere client instance with the API key
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

module.exports = cohere;