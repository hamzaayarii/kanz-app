const mongoose = require('mongoose');

const taxReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    income: {
        type: Number,
        required: true,
        min: 0 // Ajout de validation minimale
    },
    expenses: {
        type: Number,
        required: true,
        min: 0 // Ajout de validation minimale
    },
    calculatedTax: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now // Ajout de timestamp
    }
}, {
    indexes: [{ key: { userId: 1, year: 1 }, unique: true }] // Contrainte unique
});

module.exports = mongoose.model('TaxReport', taxReportSchema);