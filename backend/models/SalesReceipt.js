const mongoose = require('mongoose');

const salesReceiptSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    receiptDate: { type: Date, default: Date.now },
    receiptNumber: { type: String, unique: true, required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            tax: { type: Number, required: true },
            amount: { type: Number, required: true }
        }
    ],
    subTotal: { type: Number, required: true },
    shippingCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    attachments: [{ type: String }], // Stocke les URLs des fichiers uploadés
    paymentMode: { type: String, enum: ['Cash', 'Card', 'Bank Transfer'], required: true }
});

const SalesReceipt = mongoose.model('SalesReceipt', salesReceiptSchema);
module.exports = SalesReceipt;
