const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { extractTextFromPDF, saveExtractedText } = require('../utils/pdfProcessing');
const { chunkText, createChunkMetadata } = require('../utils/textProcessing');
const embeddingService = require('./embeddingService');
const config = require('../config/cohere');

/**
 * Process and index a document
 * @param {Object} documentInfo - Document metadata
 * @param {string} filePath - Path to uploaded file
 * @returns {Promise<Object>} - Processed document
 */
async function processDocument(documentInfo, filePath) {
  try {
    // Create document record in MongoDB
    const document = new Document({
      title: documentInfo.title,
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).slice(1).toLowerCase(),
      businessId: documentInfo.businessId,
      originalFilePath: filePath,
      status: 'processing'
    });
    
    await document.save();
    
    // Extract text based on file type
    let text = '';
    
    if (document.fileType === 'pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (document.fileType === 'txt') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error(`Unsupported file type: ${document.fileType}`);
    }
    
    // Save extracted text to file
    const textFilePath = saveExtractedText(text, filePath);
    document.rawTextPath = textFilePath;
    
    // Chunk the text
    const chunks = chunkText(text, config.retrieval.chunkSize, config.retrieval.chunkOverlap);
    
    // Create metadata for each chunk
    const chunkObjects = createChunkMetadata(chunks, {
      documentId: document._id,
      documentTitle: document.title,
      businessId: document.businessId
    });
    
    // Generate embeddings for each chunk
    const embeddingResults = await embeddingService.generateEmbeddings(chunkObjects);
    
    // Store chunk info in document
    document.chunks = embeddingResults.map(result => ({
      content: result.content,
      embeddingId: result.embeddingId,
      metadata: result.metadata
    }));
    
    // Update document status
    document.status = 'indexed';
    document.lastUpdated = Date.now();
    await document.save();
    
    return document;
  } catch (error) {
    // Update document with error status
    if (documentInfo._id) {
      await Document.findByIdAndUpdate(documentInfo._id, {
        status: 'error',
        processingError: error.message
      });
    }
    console.error(`Error processing document: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a document and its associated resources
 * @param {string} documentId - Document ID
 * @param {string} businessId - Business ID for verification
 * @returns {Promise<boolean>} - Success status
 */
async function deleteDocument(documentId, businessId) {
  try {
    const document = await Document.findOne({ _id: documentId, businessId });
    
    if (!document) {
      throw new Error('Document not found or access denied');
    }
    
    // Delete embeddings from vector store
    const embeddingIds = document.chunks.map(chunk => chunk.embeddingId);
    await embeddingService.deleteEmbeddings(embeddingIds);
    
    // Delete files
    if (document.rawTextPath && fs.existsSync(document.rawTextPath)) {
      fs.unlinkSync(document.rawTextPath);
    }
    
    if (document.originalFilePath && fs.existsSync(document.originalFilePath)) {
      fs.unlinkSync(document.originalFilePath);
    }
    
    // Delete document record
    await Document.findByIdAndDelete(documentId);
    
    return true;
  } catch (error) {
    console.error(`Error deleting document: ${error.message}`);
    throw error;
  }
}

/**
 * Get documents for a business
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} - List of documents
 */
async function getBusinessDocuments(businessId) {
  try {
    const documents = await Document.find({ businessId }).select('-chunks');
    return documents;
  } catch (error) {
    console.error(`Error fetching business documents: ${error.message}`);
    throw error;
  }
}

module.exports = {
  processDocument,
  deleteDocument,
  getBusinessDocuments
};