const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs'); // Main fs module for createWriteStream
const fsPromises = require('fs').promises; // Promises API for mkdir, access
const path = require('path');
const Business = require('../models/Business');
const BalanceSheet = require('../models/financial-Statement');
const { validationResult } = require('express-validator');
const { check } = require('express-validator');

const router = express.Router();

// Configure reports directory with absolute path
const reportsDir = path.join(process.cwd(), 'Uploads/financial-reports');

// Ensure reports directory exists (async)
const ensureReportsDir = async () => {
    try {
        await fsPromises.mkdir(reportsDir, { recursive: true });
        await fsPromises.access(reportsDir, fs.constants.W_OK);
        console.log('Reports directory ensured:', reportsDir);
    } catch (error) {
        console.error('Failed to create or access reports directory:', {
            message: error.message,
            path: reportsDir
        });
        throw new Error(`Unable to initialize storage directory: ${error.message}`);
    }
};

// Helper to format currency in TND
const formatCurrency = (value) => `${Number(value).toFixed(3)} TND`;

// Helper to format date
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

// Validation middleware for /create endpoint
const validateBalanceSheet = [
    check('businessId').isMongoId().withMessage('Invalid business ID'),
    check('periodStart').isDate().withMessage('Invalid start date'),
    check('periodEnd').isDate().withMessage('Invalid end date'),
    check('fixedAssetsTangible').optional().isFloat({ min: 0 }).withMessage('Tangible assets must be a non-negative number'),
    check('fixedAssetsIntangible').optional().isFloat({ min: 0 }).withMessage('Intangible assets must be a non-negative number'),
    check('receivables').optional().isFloat({ min: 0 }).withMessage('Receivables must be a non-negative number'),
    check('cash').optional().isFloat({ min: 0 }).withMessage('Cash must be a non-negative number'),
    check('capital').optional().isFloat({ min: 0 }).withMessage('Capital must be a non-negative number'),
    check('supplierDebts').optional().isFloat({ min: 0 }).withMessage('Supplier debts must be a non-negative number'),
    check('bankDebts').optional().isFloat({ min: 0 }).withMessage('Bank debts must be a non-negative number'),
];

// Create Manual Balance Sheet
router.post('/create', validateBalanceSheet, async (req, res) => {
    console.log('POST /api/financial-Statement/create called', { body: req.body });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const {
        businessId,
        periodStart,
        periodEnd,
        fixedAssetsTangible = 0,
        fixedAssetsIntangible = 0,
        receivables = 0,
        cash = 0,
        capital = 0,
        supplierDebts = 0,
        bankDebts = 0,
    } = req.body;

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    if (startDate > endDate) {
        console.log('Date validation failed:', { startDate, endDate });
        return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    try {
        // Verify business exists
        console.log('Fetching business:', businessId);
        const business = await Business.findById(businessId);
        if (!business) {
            console.log('Business not found:', businessId);
            return res.status(404).json({ message: 'Business not found' });
        }

        // Calculate totals
        const totalAssets = Number(fixedAssetsTangible) + Number(fixedAssetsIntangible) + Number(receivables) + Number(cash);
        const totalLiabilities = Number(supplierDebts) + Number(bankDebts);
        const totalEquity = Number(capital);
        console.log('Calculated totals:', { totalAssets, totalLiabilities, totalEquity });

        // Validate NCT compliance
        const validationErrors = [];
        const totalCheck = totalAssets - (totalLiabilities + totalEquity);
        if (Math.abs(totalCheck) > 0.01) {
            validationErrors.push('Total assets do not match total liabilities and equity');
        }
        if (totalAssets < 0) {
            validationErrors.push('Total assets cannot be negative');
        }
        if (validationErrors.length > 0) {
            console.log('NCT validation errors:', validationErrors);
        }

        // Ensure reports directory exists
        console.log('Ensuring reports directory');
        await ensureReportsDir();

        // Generate PDF
        console.log('Initializing PDFDocument');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `bilan-${businessId}-${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        console.log('Creating PDF at:', filePath);
        const writeStream = fs.createWriteStream(filePath);
        console.log('Write stream created for:', filePath);

        // Handle stream errors
        writeStream.on('error', (error) => {
            console.error('Write stream error:', {
                message: error.message,
                filePath
            });
            throw new Error(`Failed to write PDF file: ${error.message}`);
        });

        doc.pipe(writeStream);

        doc.font('Helvetica-Bold').fontSize(16).text('Bilan Comptable', { align: 'center' });
        doc.fontSize(12)
            .text(`Société: ${business.name}`, { align: 'center' })
            .text(`Matricule Fiscal: ${business.taxNumber || 'N/A'}`, { align: 'center' })
            .text(`Période: ${formatDate(startDate)} - ${formatDate(endDate)}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).text('ACTIF', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12)
            .text(`Immobilisations corporelles: ${formatCurrency(fixedAssetsTangible)}`)
            .text(`Immobilisations incorporelles: ${formatCurrency(fixedAssetsIntangible)}`)
            .text(`Créances clients: ${formatCurrency(receivables)}`)
            .text(`Trésorerie: ${formatCurrency(cash)}`)
            .font('Helvetica-Bold')
            .text(`Total Actif: ${formatCurrency(totalAssets)}`);
        doc.moveDown(2);

        doc.fontSize(14).text('PASSIF', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12)
            .text(`Capital: ${formatCurrency(capital)}`)
            .text(`Dettes fournisseurs: ${formatCurrency(supplierDebts)}`)
            .text(`Dettes bancaires: ${formatCurrency(bankDebts)}`)
            .font('Helvetica-Bold')
            .text(`Total Passif et Capitaux Propres: ${formatCurrency(totalLiabilities + totalEquity)}`);
        doc.moveDown(2);

        if (validationErrors.length > 0) {
            doc.fontSize(12).fillColor('red').text('Validation Errors:', { underline: true });
            validationErrors.forEach((err) => doc.text(`- ${err}`));
            doc.fillColor('black');
        }

        doc.fontSize(10)
            .text('Conforme aux normes comptables tunisiennes (NCT)', { align: 'center' })
            .text(`Généré le: ${formatDate(new Date())}`, { align: 'center' });

        console.log('Finalainment de la PDF');
        doc.end();

        // Wait for PDF to finish writing
        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log('PDF written successfully:', filePath);
                resolve();
            });
            writeStream.on('error', reject);
        });

        // Save balance sheet to database
        console.log('Saving balance sheet to database');
        const balanceSheet = new BalanceSheet({
            businessId,
            periodStart: startDate,
            periodEnd: endDate,
            assets: {
                fixedAssets: {
                    tangible: Number(fixedAssetsTangible),
                    intangible: Number(fixedAssetsIntangible),
                },
                receivables: Number(receivables),
                cash: Number(cash),
                totalAssets,
            },
            liabilities: {
                capital: Number(capital),
                supplierDebts: Number(supplierDebts),
                bankDebts: Number(bankDebts),
                totalLiabilities,
            },
            totalEquity,
            fileName,
            validationErrors,
        });

        await balanceSheet.save();
        console.log('Balance sheet saved:', balanceSheet._id);

        // Use environment variable for base URL
        const baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:5000';
        const downloadUrl = `${baseUrl}/Uploads/financial-reports/${fileName}`;
        console.log('Generated download URL:', downloadUrl);

        res.status(201).json({
            message: 'Balance sheet created successfully',
            balanceSheetId: balanceSheet._id,
            downloadUrl,
            validationErrors,
        });
    } catch (error) {
        console.error('CreateBalanceSheet Error:', {
            message: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// List Balance Sheets
router.get('/list', async (req, res) => {
    const { businessId } = req.query;
    console.log('GET /api/financial-Statement/list called', { businessId });

    if (!businessId) {
        console.log('Missing businessId');
        return res.status(400).json({ message: 'Business ID is required' });
    }

    try {
        const business = await Business.findById(businessId);
        if (!business) {
            console.log('Business not found:', businessId);
            return res.status(404).json({ message: 'Business not found' });
        }

        const balanceSheets = await BalanceSheet.find({ businessId })
            .select('periodStart periodEnd assets.totalAssets fileName validationErrors createdAt')
            .sort({ createdAt: -1 });
        console.log('Fetched balance sheets:', balanceSheets.length);

        res.status(200).json(balanceSheets);
    } catch (error) {
        console.error('ListBalanceSheets Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Download Balance Sheet
router.get('/download/:balanceSheetId', async (req, res) => {
    const { balanceSheetId } = req.params;
    console.log('GET /api/financial-Statement/download called', { balanceSheetId });

    try {
        const balanceSheet = await BalanceSheet.findById(balanceSheetId);
        if (!balanceSheet) {
            console.log('Balance sheet not found:', balanceSheetId);
            return res.status(404).json({ message: 'Balance sheet not found' });
        }

        const filePath = path.join(reportsDir, balanceSheet.fileName);
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
            console.log('PDF file not found:', filePath);
            return res.status(404).json({ message: 'PDF file not found' });
        }

        console.log('Downloading file:', filePath);
        res.download(filePath, `bilan-${balanceSheetId}.pdf`);
    } catch (error) {
        console.error('DownloadBalanceSheet Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete Balance Sheet
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('DELETE /api/financial-Statement called', { id });

    try {
        const balanceSheet = await BalanceSheet.findById(id);
        if (!balanceSheet) {
            console.log('Balance sheet not found:', id);
            return res.status(404).json({ message: 'Balance sheet not found' });
        }

        const filePath = path.join(reportsDir, balanceSheet.fileName);
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);
        if (fileExists) {
            await fsPromises.unlink(filePath);
            console.log('Deleted file:', filePath);
        }

        await BalanceSheet.deleteOne({ _id: id });
        console.log('Balance sheet deleted:', id);

        res.status(200).json({ message: 'Balance sheet deleted successfully' });
    } catch (error) {
        console.error('DeleteBalanceSheet Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;