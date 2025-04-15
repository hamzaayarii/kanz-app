const express = require('express');
const Product = require('../models/Product');
const { authenticate } = require('../middlewares/authMiddleware');
const Business = require('../models/Business');

const router = express.Router();

// Apply authentication middleware to all product routes
router.use(authenticate);

// Helper function to get user's business
const getUserBusiness = async (userId, userRole) => {
    let query;
    if (userRole === 'accountant') {
        query = { accountant: userId };
    } else {
        query = { owner: userId };
    }
    return await Business.findOne(query);
};

// Add a product
router.post('/', async (req, res) => {
    try {
        console.log('Received product data:', req.body);
        
        // Get the user's business based on role
        const business = await getUserBusiness(req.user._id, req.user.role);
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found. Please create a business first.' 
            });
        }

        // Validate required fields
        const requiredFields = ['type', 'name', 'unit'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate salesInfo
        if (!req.body.salesInfo || typeof req.body.salesInfo.sellingPrice === 'undefined') {
            return res.status(400).json({ 
                message: 'Sales information is required with selling price' 
            });
        }

        // Validate purchaseInfo
        if (!req.body.purchaseInfo || typeof req.body.purchaseInfo.costPrice === 'undefined') {
            return res.status(400).json({ 
                message: 'Purchase information is required with cost price' 
            });
        }

        // Create and save the product
        const newProduct = new Product({
            type: req.body.type,
            name: req.body.name,
            unit: req.body.unit,
            business: business._id,
            user: req.user._id,
            salesInfo: {
                sellingPrice: req.body.salesInfo.sellingPrice,
                description: req.body.salesInfo.description || '',
                taxCategory: req.body.salesInfo.taxCategory || 'TVA19',
                tax: req.body.salesInfo.tax
            },
            purchaseInfo: {
                costPrice: req.body.purchaseInfo.costPrice,
                description: req.body.purchaseInfo.description || '',
                taxCategory: req.body.purchaseInfo.taxCategory || 'TVA19',
                tax: req.body.purchaseInfo.tax
            }
        });

        const savedProduct = await newProduct.save();
        console.log('Saved product:', savedProduct);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
});

// Get all products with pagination, sorting and filtering
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

        // Get the user's business based on role
        const business = await getUserBusiness(req.user._id, req.user.role);
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found. Please create a business first.' 
            });
        }

        // Build query
        let query = { business: business._id };
        
        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'salesInfo.description': { $regex: search, $options: 'i' } },
                { 'purchaseInfo.description': { $regex: search, $options: 'i' } }
            ];
        }

        // Add type filter
        if (filterType !== 'all') {
            query.type = filterType;
        }

        // Build sort object
        const sort = {};
        sort[sortField] = sortDirection === 'asc' ? 1 : -1;

        // Calculate skip
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        // Get products with pagination, sorting and filtering
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            products,
            total,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        // Get the user's business based on role
        const business = await getUserBusiness(req.user._id, req.user.role);
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found. Please create a business first.' 
            });
        }

        // Find and update the product, ensuring it belongs to the user's business
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: req.params.id, business: business._id },
            req.body,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
    try {
        // Get the user's business based on role
        const business = await getUserBusiness(req.user._id, req.user.role);
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found. Please create a business first.' 
            });
        }

        // Find and delete the product, ensuring it belongs to the user's business
        const deletedProduct = await Product.findOneAndDelete({
            _id: req.params.id,
            business: business._id
        });

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
