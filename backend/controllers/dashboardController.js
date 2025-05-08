const Invoice = require('../models/Invoice');
const Business = require('../models/Business');
const User = require('../models/User');
const Expense = require('../models/Expense'); // Ajout du modèle Expense
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Get aggregated dashboard data for all businesses owned by user
exports.getAllBusinessesDashboardData = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; // Handle both formats

        // Find all businesses owned by this user
        const userBusinesses = await Business.find({ owner: userId });
        
        if (!userBusinesses || userBusinesses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucune entreprise trouvée pour cet utilisateur"
            });
        }

        const businessIds = userBusinesses.map(business => business._id);
        
        // Get current date values for filtering
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const firstDayOfYear = new Date(currentYear, 0, 1);

        // Get aggregated data across all businesses
        const [
            invoiceData,
            accountantCount,
            recentActivity
        ] = await Promise.all([
            getAggregatedInvoiceData(businessIds, firstDayOfMonth, firstDayOfYear),
            getAssignedAccountantsCount(businessIds),
            getAggregatedRecentActivity(businessIds, 10) // Limit to 10 recent activities
        ]);
        
        return res.status(200).json({
            success: true,
            data: {
                ...invoiceData,
                businessOverview: {
                    accountantCount,
                    businessCount: userBusinesses.length,
                    businessName: "Toutes les entreprises",
                    businessType: "Multiples" // Generic value for multiple businesses
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des données du tableau de bord",
            error: error.message
        });
    }
};

// Original function for single business dashboard
exports.getDashboardData = async (req, res) => {
    try {
        const { businessId } = req.params;
        const userId = req.user._id || req.user.id; // Handle both formats

        // Verify business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Entreprise introuvable"
            });
        }

        // Check if user is owner or assigned accountant
        const isOwner = business.owner.toString() === userId.toString();
        const isAccountant = req.user.role === 'accountant' && 
                            business.accountant?.toString() === userId.toString();

        if (!isOwner && !isAccountant) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès à cette entreprise"
            });
        }
        // Get current date values for filtering
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const firstDayOfYear = new Date(currentYear, 0, 1);

        // Get parallel data for dashboard
        const [
            invoiceData,
            assignedAccountants,
            businessCount,
            recentActivity
        ] = await Promise.all([
            getInvoiceData(businessId, firstDayOfMonth, firstDayOfYear),
            getAssignedAccountants(businessId),
            getBusinessCount(userId),
            getRecentActivity(businessId, 10) // Limit to 10 recent activities
        ]);
        
        return res.status(200).json({
            success: true,
            data: {
                ...invoiceData,
                businessOverview: {
                    accountantCount: assignedAccountants.length,
                    businessCount,
                    businessName: business.name,
                    businessType: business.type
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des données du tableau de bord",
            error: error.message
        });
    }
};

// Helper function to get aggregated invoice data across multiple businesses
async function getAggregatedInvoiceData(businessIds, firstDayOfMonth, firstDayOfYear) {
    // Get all invoices for all businesses
    const invoices = await Invoice.find({ 
        businessId: { $in: businessIds } 
    });
    
    // Get all expenses for all businesses
    const expenses = await Expense.find({
        business: { $in: businessIds }
    });
    
    // Filter invoices by date
    const invoicesThisMonth = invoices.filter(inv => new Date(inv.invoiceDate) >= firstDayOfMonth);
    const invoicesThisYear = invoices.filter(inv => new Date(inv.invoiceDate) >= firstDayOfYear);
    
    // Filter expenses by date
    const expensesThisMonth = expenses.filter(exp => new Date(exp.date) >= firstDayOfMonth);
    const expensesThisYear = expenses.filter(exp => new Date(exp.date) >= firstDayOfYear);
    
    // Calculate total revenue
    const revenueThisMonth = invoicesThisMonth
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const revenueThisYear = invoicesThisYear
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

    // Calculate real expenses from expense model
    const expensesAmountThisMonth = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesAmountThisYear = expensesThisYear.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group expenses by category and calculate totals
    const expenseCategoriesMap = new Map();
    
    // Process all expenses to calculate top expense categories
    for (const expense of expensesThisYear) {
        const categoryId = expense.category.toString();
        if (!expenseCategoriesMap.has(categoryId)) {
            expenseCategoriesMap.set(categoryId, {
                id: categoryId,
                name: 'Catégorie', // Default name - will be populated with proper name when you implement category lookup
                amount: 0
            });
        }
        expenseCategoriesMap.get(categoryId).amount += expense.amount;
    }
    
    // Convert to array and sort by amount descending
    const expenseCategories = Array.from(expenseCategoriesMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
    
    // Invoice summary
    const invoiceSummary = {
        paid: invoices.filter(inv => inv.status === 'paid').length,
        unpaid: invoices.filter(inv => inv.status === 'sent').length,
        overdue: invoices.filter(inv => {
            return inv.status === 'sent' && new Date(inv.dueDate) < new Date();
        }).length,
        draft: invoices.filter(inv => inv.status === 'draft').length
    };
    
    // Financial trends (monthly data) - aggregated across all businesses
    const months = Array.from({ length: 12 }, (_, i) => i);
    const financialTrends = months.map(month => {
        const monthName = new Date(2023, month, 1).toLocaleString('fr-FR', { month: 'short' });
        
        // Get invoices for this month
        const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.invoiceDate);
            return invDate.getMonth() === month && invDate.getFullYear() === new Date().getFullYear();
        });
        
        // Get expenses for this month
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === month && expDate.getFullYear() === new Date().getFullYear();
        });
        
        const revenue = monthInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0);
        
        // Real expenses from expense model
        const expensesAmount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
            name: monthName,
            revenue,
            expenses: expensesAmount
        };
    });
    
    // Transaction count
    const transactionCount = {
        income: invoices.filter(inv => inv.status === 'paid').length,
        expense: expenses.length
    };
    
    return {
        revenue: {
            thisMonth: revenueThisMonth,
            thisYear: revenueThisYear
        },
        expenses: {
            thisMonth: expensesAmountThisMonth,
            thisYear: expensesAmountThisYear
        },
        netProfit: {
            thisMonth: revenueThisMonth - expensesAmountThisMonth,
            thisYear: revenueThisYear - expensesAmountThisYear
        },
        topExpenseCategories: expenseCategories,
        transactionCount,
        invoiceSummary,
        financialTrends
    };
}

// Helper function to get total number of unique accountants assigned across businesses
async function getAssignedAccountantsCount(businessIds) {
    const accountants = await User.distinct('_id', { 
        role: 'accountant',
        'assignedTo': { $in: businessIds }
    });
    
    return accountants.length;
}

// Helper function to get recent activities across all businesses
async function getAggregatedRecentActivity(businessIds, limit = 10) {
    // Get recent invoices
    const recentInvoices = await Invoice.find({ 
        businessId: { $in: businessIds } 
    })
        .sort({ updatedAt: -1 })
        .limit(Math.floor(limit / 2)) // Use half the limit for invoices
        .select('invoiceNumber customerName status total invoiceDate updatedAt businessId');
    
    // Get recent expenses
    const recentExpenses = await Expense.find({
        business: { $in: businessIds }
    })
        .sort({ date: -1 })
        .limit(Math.floor(limit / 2)) // Use half the limit for expenses
        .select('date amount description vendor business');
    
    // Get business names for reference
    const businessMap = {};
    const businesses = await Business.find({ 
        _id: { $in: businessIds } 
    }).select('_id name');
    
    businesses.forEach(business => {
        businessMap[business._id.toString()] = business.name;
    });
    
    // Format invoice activities
    const invoiceActivities = recentInvoices.map(invoice => {
        let action;
        switch (invoice.status) {
            case 'draft': action = 'Facture brouillon créée'; break;
            case 'sent': action = 'Facture envoyée'; break;
            case 'paid': action = 'Paiement reçu'; break;
            case 'cancelled': action = 'Facture annulée'; break;
            default: action = 'Facture mise à jour';
        }
        
        // Include business name in the activity
        const businessName = businessMap[invoice.businessId.toString()] || 'Entreprise inconnue';
        
        return {
            id: invoice._id,
            type: 'invoice',
            action,
            entityId: invoice.invoiceNumber,
            entityName: invoice.customerName,
            amount: invoice.total,
            date: invoice.updatedAt || invoice.invoiceDate,
            status: invoice.status,
            businessName // Add business name to activity
        };
    });
    
    // Format expense activities
    const expenseActivities = recentExpenses.map(expense => {
        // Include business name in the activity
        const businessName = businessMap[expense.business.toString()] || 'Entreprise inconnue';
        
        return {
            id: expense._id,
            type: 'expense',
            action: 'Dépense enregistrée',
            entityId: expense._id.toString().substring(0, 8), // Use part of ID as reference
            entityName: expense.description || expense.vendor || 'Dépense',
            amount: expense.amount,
            date: expense.date,
            status: 'paid', // Expenses are typically considered paid when recorded
            businessName
        };
    });
    
    // Combine and sort activities
    const allActivities = [...invoiceActivities, ...expenseActivities]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    
    return allActivities;
}

// Helper function to get invoice-related data for a single business
async function getInvoiceData(businessId, firstDayOfMonth, firstDayOfYear) {
    // Get all invoices for the business
    const invoices = await Invoice.find({ businessId });
    
    // Get all expenses for the business
    const expenses = await Expense.find({ business: businessId });
    
    // Filter invoices by date
    const invoicesThisMonth = invoices.filter(inv => new Date(inv.invoiceDate) >= firstDayOfMonth);
    const invoicesThisYear = invoices.filter(inv => new Date(inv.invoiceDate) >= firstDayOfYear);
    
    // Filter expenses by date
    const expensesThisMonth = expenses.filter(exp => new Date(exp.date) >= firstDayOfMonth);
    const expensesThisYear = expenses.filter(exp => new Date(exp.date) >= firstDayOfYear);
    
    // Calculate total revenue
    const revenueThisMonth = invoicesThisMonth
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const revenueThisYear = invoicesThisYear
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

    // Calculate real expenses from expense model
    const expensesAmountThisMonth = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesAmountThisYear = expensesThisYear.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group expenses by category and calculate totals
    const expenseCategoriesMap = new Map();
    
    // Process all expenses to calculate top expense categories
    for (const expense of expensesThisYear) {
        const categoryId = expense.category.toString();
        if (!expenseCategoriesMap.has(categoryId)) {
            expenseCategoriesMap.set(categoryId, {
                id: categoryId,
                name: 'Catégorie', // Default name - will be populated with proper name when you implement category lookup
                amount: 0
            });
        }
        expenseCategoriesMap.get(categoryId).amount += expense.amount;
    }
    
    // Convert to array and sort by amount descending
    const expenseCategories = Array.from(expenseCategoriesMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
    
    // Invoice summary
    const invoiceSummary = {
        paid: invoices.filter(inv => inv.status === 'paid').length,
        unpaid: invoices.filter(inv => inv.status === 'sent').length,
        overdue: invoices.filter(inv => {
            return inv.status === 'sent' && new Date(inv.dueDate) < new Date();
        }).length,
        draft: invoices.filter(inv => inv.status === 'draft').length
    };
    
    // Financial trends (monthly data)
    const months = Array.from({ length: 12 }, (_, i) => i);
    const financialTrends = months.map(month => {
        const monthName = new Date(2023, month, 1).toLocaleString('fr-FR', { month: 'short' });
        
        // Get invoices for this month
        const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.invoiceDate);
            return invDate.getMonth() === month && invDate.getFullYear() === new Date().getFullYear();
        });
        
        // Get expenses for this month
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === month && expDate.getFullYear() === new Date().getFullYear();
        });
        
        const revenue = monthInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0);
        
        // Real expenses from expense model
        const expensesAmount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
            name: monthName,
            revenue,
            expenses: expensesAmount
        };
    });
    
    // Transaction count
    const transactionCount = {
        income: invoices.filter(inv => inv.status === 'paid').length,
        expense: expenses.length
    };
    
    return {
        revenue: {
            thisMonth: revenueThisMonth,
            thisYear: revenueThisYear
        },
        expenses: {
            thisMonth: expensesAmountThisMonth,
            thisYear: expensesAmountThisYear
        },
        netProfit: {
            thisMonth: revenueThisMonth - expensesAmountThisMonth,
            thisYear: revenueThisYear - expensesAmountThisYear
        },
        topExpenseCategories: expenseCategories,
        transactionCount,
        invoiceSummary,
        financialTrends
    };
}

// Get accountants assigned to this business
async function getAssignedAccountants(businessId) {
    return await User.find({ 
        role: 'accountant',
        'assignedTo': new mongoose.Types.ObjectId(businessId)
    });
}

// Get number of businesses owned by user
async function getBusinessCount(userId) {
    return await Business.countDocuments({ owner: userId });
}

// Get recent activities for a single business
async function getRecentActivity(businessId, limit = 10) {
    // Get recent invoices
    const recentInvoices = await Invoice.find({ businessId })
        .sort({ updatedAt: -1 })
        .limit(Math.floor(limit / 2)) // Use half the limit for invoices
        .select('invoiceNumber customerName status total invoiceDate updatedAt');
    
    // Get recent expenses
    const recentExpenses = await Expense.find({ business: businessId })
        .sort({ date: -1 })
        .limit(Math.floor(limit / 2)) // Use half the limit for expenses
        .select('date amount description vendor');
    
    // Format invoice activities
    const invoiceActivities = recentInvoices.map(invoice => {
        let action;
        switch (invoice.status) {
            case 'draft': action = 'Facture brouillon créée'; break;
            case 'sent': action = 'Facture envoyée'; break;
            case 'paid': action = 'Paiement reçu'; break;
            case 'cancelled': action = 'Facture annulée'; break;
            default: action = 'Facture mise à jour';
        }
        
        return {
            id: invoice._id,
            type: 'invoice',
            action,
            entityId: invoice.invoiceNumber,
            entityName: invoice.customerName,
            amount: invoice.total,
            date: invoice.updatedAt || invoice.invoiceDate,
            status: invoice.status
        };
    });
    
    // Format expense activities
    const expenseActivities = recentExpenses.map(expense => {
        return {
            id: expense._id,
            type: 'expense',
            action: 'Dépense enregistrée',
            entityId: expense._id.toString().substring(0, 8), // Use part of ID as reference
            entityName: expense.description || expense.vendor || 'Dépense',
            amount: expense.amount,
            date: expense.date,
            status: 'paid' // Expenses are typically considered paid when recorded
        };
    });
    
    // Combine and sort activities
    const allActivities = [...invoiceActivities, ...expenseActivities]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    
    return allActivities;
}