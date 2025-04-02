const express = require('express');
const router = express.Router();
const FinancialStatement = require('../models/FinancialStatement');
const Invoice = require('../models/Invoice');
const { authenticate } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

// Générer un bilan simplifié
router.post('/generate-balance-sheet', authenticate, asyncHandler(async (req, res) => {
    const { businessId, periodStart, periodEnd } = req.body;

    // Récupérer les factures pour la période donnée
    const invoices = await Invoice.find({
        businessId,
        invoiceDate: { $gte: new Date(periodStart), $lte: new Date(periodEnd) }
    });

    // Calculer les actifs (créances clients, trésorerie)
    const totalReceivables = invoices
        .filter(invoice => invoice.status !== 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0);

    // Calculer les passifs (dettes fournisseurs, etc.)
    // Note : Vous devrez ajouter un modèle pour les dettes fournisseurs si nécessaire
    const totalLiabilities = 0; // À implémenter selon vos besoins

    const balanceSheet = {
        assets: {
            receivables: totalReceivables,
            cash: 0 // À implémenter (par exemple, via intégration bancaire)
        },
        liabilities: {
            payables: totalLiabilities
        },
        equity: totalReceivables - totalLiabilities
    };

    const financialStatement = new FinancialStatement({
        businessId,
        userId: req.user.id,
        type: 'balance_sheet',
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        data: balanceSheet
    });

    await financialStatement.save();
    res.status(201).json({ message: 'Bilan généré avec succès', financialStatement });
}));

module.exports = router;