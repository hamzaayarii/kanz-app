const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { 
  initializeSchema, 
  indexDocuments, 
  searchSimilarDocuments, 
  countDocuments, 
  deleteAllDocuments 
} = require('../utils/weaviateService');
const { processDocument, processDirectory } = require('../utils/documentProcessor');
const { generateQuestionEmbedding, generateResponse } = require('../utils/cohereService');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Seuls les fichiers PDF et TXT sont acceptés.'), false);
    }
  }
});

// Initialize Weaviate schema on startup
(async () => {
  try {
    await initializeSchema();
    console.log('Schéma Weaviate initialisé avec succès');
    
    const count = await countDocuments();
    console.log(`Nombre de documents indexés: ${count}`);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
})();

// Upload and index a document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const filePath = req.file.path;
    const category = req.body.category || 'default';
    
    const chunks = await processDocument(filePath, { category });
    const results = await indexDocuments(chunks);
    
    res.json({
      success: true,
      message: `Document traité et indexé avec succès: ${chunks.length} chunks`,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Erreur lors du traitement du document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du traitement du document',
      error: error.message
    });
  }
});

// Index all documents in a directory
router.post('/indexDirectory', async (req, res) => {
  try {
    const { directory } = req.body;
    
    if (!directory || !fs.existsSync(directory)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dossier invalide ou inexistant' 
      });
    }
    
    const chunks = await processDirectory(directory);
    const results = await indexDocuments(chunks);
    
    res.json({
      success: true,
      message: `${chunks.length} chunks indexés à partir de ${directory}`,
      count: chunks.length
    });
  } catch (error) {
    console.error('Erreur lors de l\'indexation du dossier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'indexation du dossier',
      error: error.message
    });
  }
});

// Chat with the document chatbot
router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question requise' });
    }
    
    const questionEmbedding = await generateQuestionEmbedding(question);
    const similarDocuments = await searchSimilarDocuments(questionEmbedding, 5);
    
    if (!similarDocuments || similarDocuments.length === 0) {
      return res.json({
        success: true,
        answer: "I couldn't find any relevant information to answer your question. Could you rephrase or ask a more specific question about accounting for Tunisian SMEs?"
      });
    }
    
    const context = similarDocuments.map(doc => doc.text).join('\n\n');
    const answer = await generateResponse(question, context);
    
    res.json({  
      success: true,
      answer,
      sources: similarDocuments.map(doc => ({
        fileName: doc.fileName,
        category: doc.category,
        relevance: 1 - doc._additional.distance
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de la réponse',
      error: error.message
    });
  }
});

// Reset document index
router.post('/reset', async (req, res) => {
  try {
    await deleteAllDocuments();
    res.json({
      success: true,
      message: 'Index de documents réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de l\'index:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réinitialisation de l\'index',
      error: error.message
    });
  }
});

// Get document statistics
router.get('/stats', async (req, res) => {
  try {
    const count = await countDocuments();
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;