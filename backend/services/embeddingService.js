const cohere = require('../middlewares/cohereClient');
const vectorStore = require('../models/VectorStore');
const config = require('../config/cohere');
const crypto = require('crypto');

/**
 * Generate embeddings for document chunks and store in vector database
 * @param {Array} chunks - Array of text chunks with metadata
 * @returns {Promise<Array>} - Array of chunks with embedding IDs
 */
async function generateEmbeddings(chunks) {
  try {
    // Initialize vector store if needed
    await vectorStore.initialize();
    
    // Extract just the text content for embedding
    const texts = chunks.map(chunk => chunk.content);
    
    // Generate embeddings using Cohere
    const embeddingResponse = await cohere.embed({
      texts,
      model: config.embed.model,
      inputType: config.embed.inputType,
      truncate: config.embed.truncate
    });
    
    const embeddings = embeddingResponse.embeddings;
    
    // Prepare documents for vector store
    const documents = chunks.map((chunk, index) => {
      const id = crypto.randomUUID();
      return {
        id,
        embedding: embeddings[index],
        metadata: {
          ...chunk.metadata,
          content: chunk.content.substring(0, 100) + "..." // Store preview in metadata
        }
      };
    });
    
    // Store embeddings in vector database
    await vectorStore.addEmbeddings(documents);
    
    // Return chunks with embedding IDs
    return chunks.map((chunk, index) => ({
      ...chunk,
      embeddingId: documents[index].id
    }));
  } catch (error) {
    console.error(`Error generating embeddings: ${error.message}`);
    throw error;
  }
}

/**
 * Generate embedding for a query
 * @param {string} query - User query text
 * @returns {Promise<Array>} - Query embedding vector
 */
async function generateQueryEmbedding(query) {
  try {
    const embeddingResponse = await cohere.embed({
      texts: [query],
      model: config.embedQuery.model,
      inputType: config.embedQuery.inputType,
      truncate: config.embedQuery.truncate
    });
    
    return embeddingResponse.embeddings[0];
  } catch (error) {
    console.error(`Error generating query embedding: ${error.message}`);
    throw error;
  }
}

/**
 * Delete embeddings from vector store
 * @param {Array} embeddingIds - Array of embedding IDs to delete
 * @returns {Promise<void>}
 */
async function deleteEmbeddings(embeddingIds) {
  try {
    await vectorStore.deleteEmbeddings(embeddingIds);
  } catch (error) {
    console.error(`Error deleting embeddings: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateEmbeddings,
  generateQueryEmbedding,
  deleteEmbeddings
};