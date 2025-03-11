// models/TaxReport.js
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
    },
    expenses: {
        type: Number,
        required: true,
    },
    taxRate: {
        type: Number,
        required: true,  // E.g., 0.15 for 15% tax rate
    },
    calculatedTax: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }
});

module.exports = mongoose.model('TaxReport', taxReportSchema);
