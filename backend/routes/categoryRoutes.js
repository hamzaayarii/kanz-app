const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Create a new category
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    try {
        const category = new Category({ name });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a category
router.put('/:id', async (req, res) => {
    const { name } = req.body;

    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
