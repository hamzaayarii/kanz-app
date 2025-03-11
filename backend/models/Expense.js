const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    tax: { type: Number, required: true },
    averageBill: { type: Number, required: true },
    vendor: { type: String, required: true },
    reference: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
