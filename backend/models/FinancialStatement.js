const mongoose = require('mongoose');

const financialStatementSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['balance_sheet', 'income_statement', 'cash_flow'],
        required: true
    },
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    data: {
        type: Object, // Stocke les données du bilan, compte de résultat, ou flux de trésorerie
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

financialStatementSchema.index({ businessId: 1, type: 1, periodStart: 1 });

const FinancialStatement = mongoose.model('FinancialStatement', financialStatementSchema);

module.exports = FinancialStatement;