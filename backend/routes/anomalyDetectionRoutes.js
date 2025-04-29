const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const anomalyDetectionService = require('../services/anomalyDetectionService');

const router = express.Router();

// Get all anomalies for a business
router.get('/business/:businessId', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: 'Start date and end date are required' 
            });
        }

        const anomalies = await anomalyDetectionService.getAllAnomalies(
            businessId,
            new Date(startDate),
            new Date(endDate)
        );

        res.json(anomalies);
    } catch (error) {
        console.error('Error detecting anomalies:', error);
        res.status(500).json({ 
            message: 'Error detecting anomalies',
            error: error.message 
        });
    }
});

// Get specific type of anomalies
router.get('/business/:businessId/:type', authenticate, async (req, res) => {
    try {
        const { businessId, type } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: 'Start date and end date are required' 
            });
        }

        let anomalies;
        switch (type) {
            case 'revenue':
                anomalies = await anomalyDetectionService.detectRevenueAnomalies(
                    businessId,
                    new Date(startDate),
                    new Date(endDate)
                );
                break;
            case 'expense':
                anomalies = await anomalyDetectionService.detectExpenseAnomalies(
                    businessId,
                    new Date(startDate),
                    new Date(endDate)
                );
                break;
            case 'invoice':
                anomalies = await anomalyDetectionService.detectInvoiceAnomalies(
                    businessId,
                    new Date(startDate),
                    new Date(endDate)
                );
                break;
            case 'tax':
                anomalies = await anomalyDetectionService.detectTaxAnomalies(
                    businessId,
                    new Date(startDate),
                    new Date(endDate)
                );
                break;
            default:
                return res.status(400).json({ 
                    message: 'Invalid anomaly type. Must be one of: revenue, expense, invoice, tax' 
                });
        }

        res.json(anomalies);
    } catch (error) {
        console.error('Error detecting anomalies:', error);
        res.status(500).json({ 
            message: 'Error detecting anomalies',
            error: error.message 
        });
    }
});

module.exports = router; 