const mongoose = require('mongoose');

const balanceSheetSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    assets: {
        fixedAssets: {
            tangible: { type: Number, default: 0 },
            intangible: { type: Number, default: 0 },
        },
        receivables: { type: Number, default: 0 },
        cash: { type: Number, default: 0 },
        totalAssets: { type: Number, required: true },
    },
    liabilities: {
        capital: { type: Number, default: 0 },
        supplierDebts: { type: Number, default: 0 },
        bankDebts: { type: Number, default: 0 },
        totalLiabilities: { type: Number, required: true },
    },
    totalEquity: { type: Number, required: true },
    fileName: { type: String, required: true },
    validationErrors: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('financial-Statement', balanceSheetSchema);