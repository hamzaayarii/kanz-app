const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    type: { type: String, enum: ['Goods', 'Service'], required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },

    salesInfo: {
        sellingPrice: { type: Number, required: true, min: [0, 'Selling price must be a positive number'] },
        description: { type: String },
        tax: { type: Number, default: 0 }
    },

    purchaseInfo: {
        costPrice: { type: Number, required: true, min: [0, 'Cost price must be a positive number'] },
        description: { type: String },
        tax: { type: Number, default: 0 }
    }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = mongoose.model('Product', productSchema);