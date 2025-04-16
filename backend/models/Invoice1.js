const mongoose = require('mongoose');

const Invoice1Schema = new mongoose.Schema({
    invoiceName: { type: String, required: true },
    invoiceType: { type: String, enum: ['sale', 'purchase'], required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true } // Add this
});

module.exports = mongoose.model('Invoice1', Invoice1Schema);
