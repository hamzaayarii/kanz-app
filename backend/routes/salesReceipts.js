const express = require('express');
const router = express.Router();
const salesReceiptController = require('../controllers/salesReceiptController');

// 🔹 Routes pour les reçus de vente
router.get('/', salesReceiptController.getAllReceipts);
router.get('/:id', salesReceiptController.getReceiptById);
router.post('/', salesReceiptController.createReceipt);
router.put('/:id', salesReceiptController.updateReceipt);
router.delete('/:id', salesReceiptController.deleteReceipt);

module.exports = router;
