const mongoose = require('mongoose');

const incomeStatementSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    revenue: {
        sales: { type: Number, default: 0, min: 0 },
        otherRevenue: { type: Number, default: 0, min: 0 },
        totalRevenue: { type: Number, required: true, min: 0 },
    },
    expenses: {
        costOfGoodsSold: { type: Number, default: 0, min: 0 },
        salaries: { type: Number, default: 0, min: 0 },
        rent: { type: Number, default: 0, min: 0 },
        utilities: { type: Number, default: 0, min: 0 },
        marketing: { type: Number, default: 0, min: 0 },
        otherExpenses: { type: Number, default: 0, min: 0 },
        totalExpenses: { type: Number, required: true, min: 0 },
    },
    grossProfit: { type: Number, required: true },
    operatingIncome: { type: Number, required: true },
    taxes: { type: Number, default: 0, min: 0 },
    netIncome: { type: Number, required: true },
    fileName: { type: String, required: true },
    validationErrors: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

// Add a pre-save hook to ensure all numbers are properly converted
incomeStatementSchema.pre('save', function(next) {
    // Ensure revenue fields are numbers
    this.revenue.sales = parseFloat(this.revenue.sales || 0);
    this.revenue.otherRevenue = parseFloat(this.revenue.otherRevenue || 0);
    this.revenue.totalRevenue = parseFloat(this.revenue.totalRevenue || 0);
    
    // Ensure expense fields are numbers
    this.expenses.costOfGoodsSold = parseFloat(this.expenses.costOfGoodsSold || 0);
    this.expenses.salaries = parseFloat(this.expenses.salaries || 0);
    this.expenses.rent = parseFloat(this.expenses.rent || 0);
    this.expenses.utilities = parseFloat(this.expenses.utilities || 0);
    this.expenses.marketing = parseFloat(this.expenses.marketing || 0);
    this.expenses.otherExpenses = parseFloat(this.expenses.otherExpenses || 0);
    this.expenses.totalExpenses = parseFloat(this.expenses.totalExpenses || 0);
    
    // Ensure other financial fields are numbers
    this.grossProfit = parseFloat(this.grossProfit || 0);
    this.operatingIncome = parseFloat(this.operatingIncome || 0);
    this.taxes = parseFloat(this.taxes || 0);
    this.netIncome = parseFloat(this.netIncome || 0);
    
    next();
});

module.exports = mongoose.model('IncomeStatement', incomeStatementSchema); 