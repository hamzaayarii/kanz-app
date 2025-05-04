const Document = require('../models/Document');
const vectorStore = require('../models/VectorStore');
const embeddingService = require('./embeddingService');
const cohere = require('../middlewares/cohereClient');
const config = require('../config/cohere');

/**
 * Retrieve relevant document chunks for a query
 * @param {string} query - User query
 * @param {string} businessId - Business ID for context filtering
 * @param {number} topK - Number of chunks to retrieve
 * @returns {Promise<Array>} - Array of relevant chunks with content and metadata
 */
async function retrieveRelevantChunks(query, businessId, topK = config.retrieval.topK) {
  try {
    // Generate embedding for query
    const queryEmbedding = await embeddingService.generateQueryEmbedding(query);
    
    // Query vector store with business ID filter
    const queryResults = await vectorStore.queryEmbeddings(
      queryEmbedding, 
      topK,
      { businessId } // Filter by businessId in metadata
    );
    
    // Filter results by minimum similarity score
    const relevantResults = queryResults.ids[0].map((id, i) => ({
      id,
      content: queryResults.metadatas[0][i].content,
      documentId: queryResults.metadatas[0][i].documentId,
      documentTitle: queryResults.metadatas[0][i].documentTitle,
      similarity: queryResults.distances[0][i]
    })).filter(result => result.similarity >= config.retrieval.minRelevanceScore);
    
    // Fetch full content for each chunk
    const fullContentChunks = await Promise.all(
      relevantResults.map(async result => {
        try {
          const document = await Document.findById(result.documentId);
          if (!document) return result;
          
          // Find the matching chunk in the document
          const chunk = document.chunks.find(c => c.embeddingId === result.id);
          if (chunk) {
            return {
              ...result,
              content: chunk.content, // Use full content from MongoDB
              documentTitle: document.title
            };
          }
          return result;
        } catch (err) {
          console.error(`Error fetching document content: ${err.message}`);
          return result;
        }
      })
    );
    
    return fullContentChunks;
  } catch (error) {
    console.error(`Error retrieving chunks: ${error.message}`);
    throw error;
  }
}

/**
 * Build context string from retrieved chunks
 * @param {Array} chunks - Retrieved relevant chunks
 * @returns {string} - Formatted context string
 */
function buildContextString(chunks) {
  if (!chunks || chunks.length === 0) {
    return "No relevant context found.";
  }
  
  return chunks.map((chunk, index) => {
    return `
[DOCUMENT ${index + 1}]: ${chunk.documentTitle || 'Untitled Document'}
[CONTENT]: 
${chunk.content}
---
`;
  }).join('\n');
}

/**
 * Generate response with RAG
 * @param {string} query - User query
 * @param {Object} userContext - User context information
 * @returns {Promise<string>} - Generated response
 */
async function generateResponse(query, userContext) {
  try {
    // Retrieve relevant chunks
    const relevantChunks = await retrieveRelevantChunks(query, userContext.businessId);
    
    // Build context string
    const contextString = buildContextString(relevantChunks);
    
    // Build prompt with context
    const prompt = `
You are an AI assistant specialized in accounting, taxation, and legal matters.
You are helping a user who works as ${userContext.role} at ${userContext.businessName}.

[USER QUERY]: ${query}

[RETRIEVED CONTEXT]:
${contextString}

Based on the retrieved context and your knowledge of accounting and tax principles, provide a helpful, accurate, and concise response.
If the retrieved context doesn't contain relevant information, rely on your general knowledge but clearly indicate when you're doing so.
If you need more specific information, let the user know what additional details would help you provide a better answer.

[YOUR RESPONSE]:
`;
    
    // Generate response using Cohere
    const response = await cohere.generate({
      prompt,
      ...config.generate,
      maxTokens: config.generate.maxTokens,
      temperature: config.generate.temperature
    });
    
    return response.generations[0].text.trim();
  } catch (error) {
    console.error(`Error generating response: ${error.message}`);
    throw error;
  }
}

module.exports = {
  retrieveRelevantChunks,
  buildContextString,
  generateResponse
};