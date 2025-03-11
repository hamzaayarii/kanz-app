const SalesReceipt = require('../models/SalesReceipt');

// 🔹 Récupérer tous les reçus avec les détails des produits
exports.getAllReceipts = async (req, res) => {
    try {
        const receipts = await SalesReceipt.find().populate('items.product');
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// 🔹 Récupérer un reçu par ID
exports.getReceiptById = async (req, res) => {
    try {
        const receipt = await SalesReceipt.findById(req.params.id).populate('items.product');
        if (!receipt) {
            return res.status(404).json({ message: 'Reçu non trouvé' });
        }
        res.json(receipt);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// 🔹 Créer un nouveau reçu de vente
exports.createReceipt = async (req, res) => {
    try {
        const newReceipt = new SalesReceipt(req.body);
        await newReceipt.save();
        res.status(201).json(newReceipt);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création', error });
    }
};

// 🔹 Mettre à jour un reçu existant
exports.updateReceipt = async (req, res) => {
    try {
        const updatedReceipt = await SalesReceipt.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('items.product');
        if (!updatedReceipt) {
            return res.status(404).json({ message: 'Reçu non trouvé' });
        }
        res.json(updatedReceipt);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error });
    }
};

// 🔹 Supprimer un reçu
exports.deleteReceipt = async (req, res) => {
    try {
        const deletedReceipt = await SalesReceipt.findByIdAndDelete(req.params.id);
        if (!deletedReceipt) {
            return res.status(404).json({ message: 'Reçu non trouvé' });
        }
        res.json({ message: 'Reçu supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression', error });
    }
};