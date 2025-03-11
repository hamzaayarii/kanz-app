const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceName: { type: String, required: true },
    invoiceType: { type: String, enum: ['sale', 'purchase'], required: true }, // Sale or Purchase
    filePath: { type: String, required: true }, // Path to uploaded file
    uploadedAt: { type: Date, default: Date.now } // Timestamp
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
