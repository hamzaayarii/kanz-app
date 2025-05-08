require('dotenv').config();

module.exports = {
  apiKey: process.env.COHERE_API_KEY,
  
  // Generation model settings
  generate: {
    model: "command-r-plus", // Or the latest model available
    maxTokens: 500,
    temperature: 0.7,
    k: 0,
    stopSequences: [],
    returnLikelihoods: "NONE"
  },
  
  // Embedding model settings
  embed: {
    model: "embed-english-v3.0", // Or the latest embedding model
    inputType: "search_document", // For document embeddings
    truncate: "END"
  },
  
  // Embedding model for queries
  embedQuery: {
    model: "embed-english-v3.0",
    inputType: "search_query", // For query embeddings
    truncate: "END"
  },
  
  // RAG settings
  retrieval: {
    topK: 5, // Number of chunks to retrieve
    minRelevanceScore: 0.7, // Minimum similarity score (0-1)
    chunkSize: 1000, // Target chunk size
    chunkOverlap: 200 // Overlap between chunks
  }
};