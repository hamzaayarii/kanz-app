const mongoose = require('mongoose');

const dailyRevenueSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    revenues: {
        cash: {
            sales: { type: Number, default: 0 },
            returns: { type: Number, default: 0 },
            netCash: { type: Number, default: 0 }
        },
        card: {
            sales: { type: Number, default: 0 },
            returns: { type: Number, default: 0 },
            netCard: { type: Number, default: 0 }
        },
        other: [{
            type: { type: String, required: true },
            amount: { type: Number, required: true }
        }]
    },
    expenses: {
        petty: { type: Number, default: 0 },
        other: [{
            description: { type: String, required: true },
            amount: { type: Number, required: true }
        }]
    },
    summary: {
        totalRevenue: { type: Number, default: 0 },
        totalExpenses: { type: Number, default: 0 },
        netDaily: { type: Number, default: 0 }
    },
    notes: { type: String },
    autoJournalEntry: { type: Boolean, default: true },
    journalEntry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalEntry'
    },
    status: {
        type: String,
        enum: ['DRAFT', 'POSTED', 'VERIFIED'],
        default: 'DRAFT'
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate totals
dailyRevenueSchema.pre('save', function(next) {
    // Calculate net cash and card
    this.revenues.cash.netCash = this.revenues.cash.sales - this.revenues.cash.returns;
    this.revenues.card.netCard = this.revenues.card.sales - this.revenues.card.returns;

    // Calculate total revenue
    const otherRevenue = this.revenues.other.reduce((sum, item) => sum + item.amount, 0);
    this.summary.totalRevenue = this.revenues.cash.netCash + this.revenues.card.netCard + otherRevenue;

    // Calculate total expenses
    const otherExpenses = this.expenses.other.reduce((sum, item) => sum + item.amount, 0);
    this.summary.totalExpenses = this.expenses.petty + otherExpenses;

    // Calculate net daily
    this.summary.netDaily = this.summary.totalRevenue - this.summary.totalExpenses;

    next();
});

const DailyRevenue = mongoose.model('DailyRevenue', dailyRevenueSchema);

module.exports = DailyRevenue; 