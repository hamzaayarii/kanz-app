const JournalEntry = require('../models/JournalEntry');

// Get all journal entries with pagination and filters
exports.getEntries = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            status,
            searchTerm
        } = req.query;

        const query = {};

        // Add date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Add search functionality
        if (searchTerm) {
            query.$or = [
                { pieceNumber: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { 'entries.accountName': { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const total = await JournalEntry.countDocuments(query);
        const entries = await JournalEntry.find(query)
            .sort({ date: -1, pieceNumber: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            entries,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
    }
};

// Create new journal entry
exports.createEntry = async (req, res) => {
    try {
        // Generate piece number
        const year = new Date().getFullYear();
        const lastEntry = await JournalEntry.findOne({
            pieceNumber: new RegExp(`^JE-${year}`)
        }).sort({ pieceNumber: -1 });

        let sequence = '00001';
        if (lastEntry) {
            const lastSequence = parseInt(lastEntry.pieceNumber.split('-')[2]);
            sequence = String(lastSequence + 1).padStart(5, '0');
        }

        const pieceNumber = `JE-${year}-${sequence}`;

        const journalEntry = new JournalEntry({
            ...req.body,
            pieceNumber,
            fiscalYear: year.toString()
        });

        const savedEntry = await journalEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error('Error creating journal entry:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating journal entry', error: error.message });
    }
};

// Get journal entry by ID
exports.getEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }
        res.json(entry);
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        res.status(500).json({ message: 'Error fetching journal entry', error: error.message });
    }
};

// Update journal entry
exports.updateEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }

        if (entry.status === 'VERIFIED') {
            return res.status(400).json({ message: 'Cannot modify a verified journal entry' });
        }

        const updatedEntry = await JournalEntry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedEntry);
    } catch (error) {
        console.error('Error updating journal entry:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error updating journal entry', error: error.message });
    }
};

// Delete journal entry
exports.deleteEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }

        if (entry.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only draft entries can be deleted' });
        }

        await JournalEntry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Journal entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
    }
};

// Update entry status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const entry = await JournalEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }

        // Validate status transition
        const validTransitions = {
            'DRAFT': ['POSTED'],
            'POSTED': ['VERIFIED'],
            'VERIFIED': []
        };

        if (!validTransitions[entry.status].includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${entry.status} to ${status}`
            });
        }

        // Additional validation for posting/verifying
        if (status === 'POSTED' || status === 'VERIFIED') {
            if (!entry.isBalanced) {
                return res.status(400).json({
                    message: 'Cannot post/verify unbalanced entry'
                });
            }
        }

        entry.status = status;
        await entry.save();
        res.json(entry);
    } catch (error) {
        console.error('Error updating journal entry status:', error);
        res.status(500).json({ message: 'Error updating entry status', error: error.message });
    }
}; 