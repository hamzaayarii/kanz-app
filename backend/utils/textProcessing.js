const config = require('../config/cohere');

/**
 * Split text into chunks of roughly equal size with optional overlap
 * @param {string} text - Full text to be chunked
 * @param {number} chunkSize - Target size of each chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {Array} Array of text chunks
 */
function chunkText(text, chunkSize = config.retrieval.chunkSize, overlap = config.retrieval.chunkOverlap) {
  const chunks = [];
  
  // Simple approach: split by sentences and combine until target chunk size
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed chunk size, start a new chunk
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      const overlapText = words.slice(-Math.floor(overlap / 5)).join(' '); // Approximate word count for overlap
      currentChunk = overlapText + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Create document metadata for each chunk
 * @param {Array} chunks - Array of text chunks
 * @param {Object} documentInfo - Information about the parent document
 * @returns {Array} Array of chunk objects with metadata
 */
function createChunkMetadata(chunks, documentInfo) {
  let lastCharIndex = 0;
  
  return chunks.map((chunk, index) => {
    const startIndex = lastCharIndex;
    const endIndex = startIndex + chunk.length;
    lastCharIndex = endIndex + 1; // +1 for the space
    
    return {
      content: chunk,
      metadata: {
        startIndex,
        endIndex,
        chunkIndex: index,
        totalChunks: chunks.length,
        ...documentInfo
      }
    };
  });
}

/**
 * Clean and normalize text
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .trim();
}

module.exports = {
  chunkText,
  createChunkMetadata,
  cleanText
};