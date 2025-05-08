// const path = require('path');
// const fs = require('fs');
// const documentService = require('../services/documentService');
// const Document = require('../models/Document');

// /**
//  * Upload and process a new document
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// async function uploadDocument(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }
    
//     // Validate business ID from authenticated user or request
//     const businessId = req.body.businessId || req.user?.businessId;
//     if (!businessId) {
//       return res.status(400).json({ error: 'Business ID is required' });
//     }
    
//     // Check file type
//     const fileExt = path.extname(req.file.originalname).toLowerCase();
//     const allowedTypes = ['.pdf', '.txt'];
    
//     if (!allowedTypes.includes(fileExt)) {
//       // Delete the uploaded file
//       fs.unlinkSync(req.file.path);
//       return res.status(400).json({ 
//         error: `Unsupported file type. Please upload ${allowedTypes.join(' or ')} files.`
//       });
//     }
    
//     // Prepare document info
//     const documentInfo = {
//       title: req.body.title || path.basename(req.file.originalname, fileExt),
//       businessId
//     };
    
//     // Process document asynchronously and return immediate response
//     const document = await documentService.processDocument(documentInfo, req.file.path);
    
//     res.status(201).json({
//       message: 'Document uploaded and processing started',
//       documentId: document._id,
//       status: document.status
//     });
//   } catch (error) {
//     console.error('Error in uploadDocument:', error);
//     res.status(500).json({ error: 'Failed to process document: ' + error.message });
//   }
// }

// /**
//  * Get all documents for a business
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// async function getDocuments(req, res) {
//   try {
//     // Get business ID from authenticated user or query parameter
//     const businessId = req.query.businessId || req.user?.businessId;
    
//     if (!businessId) {
//       return res.status(400).json({ error: 'Business ID is required' });
//     }
    
//     const documents = await documentService.getBusinessDocuments(businessId);
//     res.json({ documents });
//   } catch (error) {
//     console.error('Error in getDocuments:', error);
//     res.status(500).json({ error: 'Failed to retrieve documents: ' + error.message });
//   }
// }

// /**
//  * Delete a document
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// async function deleteDocument(req, res) {
//   try {
//     const { documentId } = req.params;
//     const businessId = req.query.businessId || req.user?.businessId;
    
//     if (!businessId) {
//       return res.status(400).json({ error: 'Business ID is required' });
//     }
    
//     await documentService.deleteDocument(documentId, businessId);
//     res.json({ message: 'Document deleted successfully' });
//   } catch (error) {
//     console.error('Error in deleteDocument:', error);
//     res.status(500).json({ error: 'Failed to delete document: ' + error.message });
//   }
// }

// /**
//  * Get document status
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// async function getDocumentStatus(req, res) {
//   try {
//     const { documentId } = req.params;
//     const businessId = req.query.businessId || req.user?.businessId;
    
//     if (!businessId) {
//       return res.status(400).json({ error: 'Business ID is required' });
//     }
    
//     const document = await Document.findOne({ _id: documentId, businessId })
//       .select('status processingError');
    
//     if (!document) {
//       return res.status(404).json({ error: 'Document not found' });
//     }
    
//     res.json({ 
//       documentId,
//       status: document.status,
//       error: document.processingError || null
//     });
//   } catch (error) {
//     console.error('Error in getDocumentStatus:', error);
//     res.status(500).json({ error: 'Failed to retrieve document status: ' + error.message });
//   }
// }

// module.exports = {
//   uploadDocument,
//   getDocuments,
//   deleteDocument,
//   getDocumentStatus
// };