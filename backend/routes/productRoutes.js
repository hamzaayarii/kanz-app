const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Ajouter un produit
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer tous les produits avec pagination, tri et filtrage
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortField = 'name',
            sortDirection = 'asc',
            filterType = 'all'
        } = req.query;

        // Construire la requête
        let query = {};
        
        // Ajouter filtre de recherche
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'salesInfo.description': { $regex: search, $options: 'i' } },
                { 'purchaseInfo.description': { $regex: search, $options: 'i' } }
            ];
        }

        // Ajouter filtre de type
        if (filterType !== 'all') {
            query.type = filterType;
        }

        // Construire objet de tri
        const sort = {};
        sort[sortField] = sortDirection === 'asc' ? 1 : -1;

        // Calculer skip
        const skip = (page - 1) * limit;

        // Obtenir le nombre total pour la pagination
        const total = await Product.countDocuments(query);

        // Obtenir les produits avec pagination, tri et filtrage
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Calculer le nombre total de pages
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            products,
            total,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un produit
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un produit par ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
