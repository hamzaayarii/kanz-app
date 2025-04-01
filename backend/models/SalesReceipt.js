const mongoose = require('mongoose');

const salesReceiptSchema = new mongoose.Schema({
    receiptDate: { type: Date, default: Date.now },
    receiptNumber: { type: String, unique: true, required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            taxCategory: { 
                type: String, 
                enum: ['TVA19', 'TVA13', 'TVA7', 'Exonéré'],
                required: true 
            },
            tax: { type: Number, required: true },
            taxAmount: { type: Number, required: true },
            subtotal: { type: Number, required: true }, // Amount before tax
            amount: { type: Number, required: true }    // Amount including tax
        }
    ],
    subTotal: { type: Number, required: true },        // Sum of all items before tax
    totalTaxByCategory: {
        TVA19: { type: Number, default: 0 },
        TVA13: { type: Number, default: 0 },
        TVA7: { type: Number, default: 0 },
        'Exonéré': { type: Number, default: 0 }
    },
    totalTax: { type: Number, required: true },        // Sum of all tax amounts
    shippingCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },           // Final total including tax and shipping
    attachments: [{ type: String }], // Stocke les URLs des fichiers uploadés
    paymentMode: { type: String, enum: ['Cash', 'Card', 'Bank Transfer'], required: true },
    notes: { type: String },
    currency: { 
        type: String, 
        enum: ['TND'], 
        default: 'TND',
        required: true 
    }
});

// Calculate totals before saving
salesReceiptSchema.pre('save', function(next) {
    // Initialize totals
    this.subTotal = 0;
    this.totalTax = 0;
    this.totalTaxByCategory = {
        TVA19: 0,
        TVA13: 0,
        TVA7: 0,
        'Exonéré': 0
    };

    // Calculate totals for each item
    this.items.forEach(item => {
        // Calculate item subtotal (before tax)
        item.subtotal = item.quantity * item.rate;
        
        // Calculate tax amount
        item.taxAmount = (item.subtotal * item.tax) / 100;
        
        // Calculate total amount including tax
        item.amount = item.subtotal + item.taxAmount;
        
        // Add to receipt totals
        this.subTotal += item.subtotal;
        this.totalTax += item.taxAmount;
        this.totalTaxByCategory[item.taxCategory] += item.taxAmount;
    });

    // Calculate final total
    this.total = this.subTotal + this.totalTax + this.shippingCharges;

    next();
});

const SalesReceipt = mongoose.model('SalesReceipt', salesReceiptSchema);
module.exports = SalesReceipt;
