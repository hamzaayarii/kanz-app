const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    description: { type: String },
    vendor: { type: String },
    reference: { type: String },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
