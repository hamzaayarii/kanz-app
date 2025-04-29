const mongoose = require('mongoose');
const DailyRevenue = require('../models/DailyRevenue');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const TaxReport = require('../models/TaxReport');

class AnomalyDetectionService {
    constructor() {
        this.thresholds = {
            revenueDeviation: 2.0, // Standard deviations
            expenseDeviation: 2.0,
            invoiceAmountDeviation: 2.0,
            taxDeviation: 1.5
        };
    }

    // Calculate mean and standard deviation
    calculateStats(values) {
        if (!values || values.length === 0) {
            return { mean: 0, stdDev: 0 };
        }
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return { mean, stdDev };
    }

    // Detect anomalies in daily revenue
    async detectRevenueAnomalies(businessId, startDate, endDate) {
        const revenues = await DailyRevenue.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (!revenues || revenues.length === 0) {
            return [];
        }

        const dailyTotals = revenues.map(r => r.summary.totalRevenue);
        const { mean, stdDev } = this.calculateStats(dailyTotals);

        return revenues.map(revenue => {
            const zScore = Math.abs((revenue.summary.totalRevenue - mean) / stdDev);
            return {
                date: revenue.date,
                value: revenue.summary.totalRevenue,
                isAnomaly: zScore > this.thresholds.revenueDeviation,
                zScore,
                mean,
                stdDev
            };
        }).filter(r => r.isAnomaly);
    }

    // Detect anomalies in expenses
    async detectExpenseAnomalies(businessId, startDate, endDate) {
        const expenses = await Expense.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (!expenses || expenses.length === 0) {
            return [];
        }

        const expenseAmounts = expenses.map(e => e.amount);
        const { mean, stdDev } = this.calculateStats(expenseAmounts);

        return expenses.map(expense => {
            const zScore = Math.abs((expense.amount - mean) / stdDev);
            return {
                date: expense.date,
                value: expense.amount,
                category: expense.category,
                isAnomaly: zScore > this.thresholds.expenseDeviation,
                zScore,
                mean,
                stdDev
            };
        }).filter(e => e.isAnomaly);
    }

    // Detect anomalies in invoice amounts
    async detectInvoiceAnomalies(businessId, startDate, endDate) {
        const invoices = await Invoice.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (!invoices || invoices.length === 0) {
            return [];
        }

        const invoiceAmounts = invoices.map(i => i.total);
        const { mean, stdDev } = this.calculateStats(invoiceAmounts);

        return invoices.map(invoice => {
            const zScore = Math.abs((invoice.total - mean) / stdDev);
            return {
                date: invoice.date,
                value: invoice.total,
                clientName: invoice.clientName,
                isAnomaly: zScore > this.thresholds.invoiceAmountDeviation,
                zScore,
                mean,
                stdDev
            };
        }).filter(i => i.isAnomaly);
    }

    // Detect anomalies in tax calculations
    async detectTaxAnomalies(businessId, startDate, endDate) {
        const taxReports = await TaxReport.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (!taxReports || taxReports.length === 0) {
            return [];
        }

        const taxAmounts = taxReports.map(t => t.calculatedTax);
        const { mean, stdDev } = this.calculateStats(taxAmounts);

        return taxReports.map(report => {
            const zScore = Math.abs((report.calculatedTax - mean) / stdDev);
            return {
                date: report.date,
                value: report.calculatedTax,
                income: report.income,
                expenses: report.expenses,
                isAnomaly: zScore > this.thresholds.taxDeviation,
                zScore,
                mean,
                stdDev
            };
        }).filter(t => t.isAnomaly);
    }

    // Get all anomalies for a business
    async getAllAnomalies(businessId, startDate, endDate) {
        const [revenueAnomalies, expenseAnomalies, invoiceAnomalies, taxAnomalies] = await Promise.all([
            this.detectRevenueAnomalies(businessId, startDate, endDate),
            this.detectExpenseAnomalies(businessId, startDate, endDate),
            this.detectInvoiceAnomalies(businessId, startDate, endDate),
            this.detectTaxAnomalies(businessId, startDate, endDate)
        ]);

        return {
            revenueAnomalies,
            expenseAnomalies,
            invoiceAnomalies,
            taxAnomalies,
            totalAnomalies: revenueAnomalies.length + expenseAnomalies.length + 
                           invoiceAnomalies.length + taxAnomalies.length
        };
    }
}

module.exports = new AnomalyDetectionService(); 