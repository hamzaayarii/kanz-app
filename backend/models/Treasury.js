const mongoose = require('mongoose');

const treasurySchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    dateRange: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    openingBalance: { type: Number, default: 0 },
    totalInflows: { type: Number, default: 0 },   // cash/card/other revenues
    totalOutflows: { type: Number, default: 0 },  // expenses + payroll
    closingBalance: { type: Number, default: 0 },

    details: {
        revenueFromDaily: { type: Number, default: 0 },
        expensesFromDaily: { type: Number, default: 0 },
        expensesFromExpenses: { type: Number, default: 0 },
        payrollOutflows: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

treasurySchema.index({ business: 1, 'dateRange.start': 1 }, { unique: true });

const Treasury = mongoose.model('Treasury', treasurySchema);
module.exports = Treasury;
