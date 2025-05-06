const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs'); // Main fs module for createWriteStream
const fsPromises = require('fs').promises; // Promises API for mkdir, access
const path = require('path');
const Business = require('../models/Business');
const IncomeStatement = require('../models/IncomeStatement');
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

// Validation for create income statement
const createIncomeStatementValidation = [
    check('businessId').isMongoId().withMessage('Valid business ID is required'),
    check('periodStart')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be in a valid date format'),
    check('periodEnd')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be in a valid date format')
        .custom((value, { req }) => {
            const startDate = new Date(req.body.periodStart);
            const endDate = new Date(value);
            if (startDate > endDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    check('revenue.sales').isNumeric().withMessage('Sales revenue must be a number'),
    check('revenue.otherRevenue').isNumeric().withMessage('Other revenue must be a number'),
    check('expenses.costOfGoodsSold').isNumeric().withMessage('Cost of goods sold must be a number'),
    check('expenses.salaries').isNumeric().withMessage('Salaries must be a number'),
    check('expenses.rent').isNumeric().withMessage('Rent must be a number'),
    check('expenses.utilities').isNumeric().withMessage('Utilities must be a number'),
    check('expenses.marketing').isNumeric().withMessage('Marketing expenses must be a number'),
    check('expenses.otherExpenses').isNumeric().withMessage('Other expenses must be a number'),
    check('taxes').isNumeric().withMessage('Taxes must be a number'),
];

// Create Income Statement
router.post('/create', createIncomeStatementValidation, async (req, res) => {
    console.log('POST /api/income-statement/create called with body:', req.body);
    
    // Validate request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure with let for variables that might be reassigned
    const { businessId, periodStart, periodEnd } = req.body;
    let { revenue, expenses, taxes } = req.body;

    console.log('Received dates:', { periodStart, periodEnd });

    try {
        // Verify business exists
        console.log('Fetching business:', businessId);
        const business = await Business.findById(businessId);
        if (!business) {
            console.log('Business not found:', businessId);
            return res.status(404).json({ message: 'Business not found' });
        }

        // Parse dates
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.log('Invalid date format received:', { periodStart, periodEnd });
            return res.status(400).json({ message: 'Invalid date format' });
        }
        
        console.log('Parsed dates:', { 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
        });

        // Helper function to safely convert values to numbers
        const safeNumber = (value) => {
            if (value === "" || value === null || value === undefined) return 0;
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        };

        // Ensure revenue and expenses objects exist
        revenue = revenue || {};
        expenses = expenses || {};

        // Extract and convert revenue values
        const salesRevenue = safeNumber(revenue.sales);
        const otherRevenue = safeNumber(revenue.otherRevenue);
        
        // Extract and convert expense values
        const costOfGoodsSold = safeNumber(expenses.costOfGoodsSold);
        const salariesExpense = safeNumber(expenses.salaries);
        const rentExpense = safeNumber(expenses.rent);
        const utilitiesExpense = safeNumber(expenses.utilities);
        const marketingExpense = safeNumber(expenses.marketing);
        const otherExpensesValue = safeNumber(expenses.otherExpenses);
        
        // Extract and convert taxes value
        const taxesValue = safeNumber(taxes);

        // Calculate totals using the safely converted values
        const totalRevenue = salesRevenue + otherRevenue;
        const totalExpenses = costOfGoodsSold + salariesExpense + 
                        rentExpense + utilitiesExpense + 
                        marketingExpense + otherExpensesValue;
        
        const grossProfit = totalRevenue - costOfGoodsSold;
        const operatingIncome = grossProfit - (totalExpenses - costOfGoodsSold);
        const netIncome = operatingIncome - taxesValue;
        
        console.log('Calculated totals:', { 
            totalRevenue, 
            totalExpenses, 
            grossProfit, 
            operatingIncome, 
            netIncome,
            salesRevenue,
            otherRevenue,
            costOfGoodsSold,
            salariesExpense,
            rentExpense,
            utilitiesExpense,
            marketingExpense,
            otherExpensesValue,
            taxesValue
        });

        // Validate financial compliance
        const validationErrors = [];
        if (totalRevenue < 0) {
            validationErrors.push('Total revenue cannot be negative');
        }
        if (validationErrors.length > 0) {
            console.log('Validation errors:', validationErrors);
        }

        // Ensure reports directory exists
        console.log('Ensuring reports directory');
        await ensureReportsDir();

        // Generate PDF
        console.log('Initializing PDFDocument');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `income-statement-${businessId}-${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        console.log('Creating PDF at:', filePath);
        const writeStream = fs.createWriteStream(filePath);
        console.log('Write stream created for:', filePath);

        // Pipe the PDF to the file
        doc.pipe(writeStream);

        // Set up PDF content
        doc.fontSize(20).text('Income Statement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Business: ${business.name}`);
        doc.fontSize(12).text(`Period: ${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`);
        doc.moveDown();

        // Revenue section
        doc.fontSize(14).text('Revenue', { underline: true });
        doc.fontSize(10).text(`Sales: ${formatCurrency(revenue.sales)}`);
        doc.fontSize(10).text(`Other Revenue: ${formatCurrency(revenue.otherRevenue)}`);
        doc.fontSize(12).text(`Total Revenue: ${formatCurrency(totalRevenue)}`, { bold: true });
        doc.moveDown();

        // Expenses section
        doc.fontSize(14).text('Expenses', { underline: true });
        doc.fontSize(10).text(`Cost of Goods Sold: ${formatCurrency(expenses.costOfGoodsSold)}`);
        doc.fontSize(12).text(`Gross Profit: ${formatCurrency(grossProfit)}`, { bold: true });
        doc.moveDown();
        
        doc.fontSize(10).text(`Salaries: ${formatCurrency(expenses.salaries)}`);
        doc.fontSize(10).text(`Rent: ${formatCurrency(expenses.rent)}`);
        doc.fontSize(10).text(`Utilities: ${formatCurrency(expenses.utilities)}`);
        doc.fontSize(10).text(`Marketing: ${formatCurrency(expenses.marketing)}`);
        doc.fontSize(10).text(`Other Expenses: ${formatCurrency(expenses.otherExpenses)}`);
        doc.fontSize(12).text(`Total Expenses: ${formatCurrency(totalExpenses)}`, { bold: true });
        doc.moveDown();

        // Summary section
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12).text(`Operating Income: ${formatCurrency(operatingIncome)}`, { bold: true });
        doc.fontSize(10).text(`Taxes: ${formatCurrency(taxes)}`);
        doc.fontSize(14).text(`Net Income: ${formatCurrency(netIncome)}`, { bold: true });
        
        // Finalize PDF
        doc.end();

        // Wait for the PDF to be created
        writeStream.on('finish', async () => {
            console.log('PDF creation finished');
            
            // Create income statement record in database
            const incomeStatement = new IncomeStatement({
                businessId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                revenue: {
                    sales: salesRevenue,
                    otherRevenue: otherRevenue,
                    totalRevenue
                },
                expenses: {
                    costOfGoodsSold: costOfGoodsSold,
                    salaries: salariesExpense,
                    rent: rentExpense,
                    utilities: utilitiesExpense,
                    marketing: marketingExpense,
                    otherExpenses: otherExpensesValue,
                    totalExpenses
                },
                grossProfit,
                operatingIncome,
                taxes: taxesValue,
                netIncome,
                fileName,
                validationErrors
            });

            const saved = await incomeStatement.save();
            console.log('Income statement saved to database:', saved._id);

            res.status(201).json({
                message: 'Income statement created successfully',
                incomeStatement: saved,
                validationErrors,
                downloadUrl: `/api/income-statement/download/${saved._id}`
            });
        });

        writeStream.on('error', (err) => {
            console.error('Error creating PDF:', err);
            res.status(500).json({
                message: 'Failed to create income statement PDF',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
    } catch (error) {
        console.error('CreateIncomeStatement Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Download Income Statement
router.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    console.log('GET /api/income-statement/download/:id called', { id });

    try {
        // Find income statement
        const incomeStatement = await IncomeStatement.findById(id);
        if (!incomeStatement) {
            console.log('Income statement not found:', id);
            return res.status(404).json({ message: 'Income statement not found' });
        }

        // Ensure the file exists
        const filePath = path.join(reportsDir, incomeStatement.fileName);
        await fsPromises.access(filePath, fs.constants.R_OK);

        // Send the file
        console.log('Sending file:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('DownloadIncomeStatement Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// List Income Statements
router.get('/list', async (req, res) => {
    const { businessId } = req.query;
    console.log('GET /api/income-statement/list called', { businessId });

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

        const incomeStatements = await IncomeStatement.find({ businessId })
            .select('periodStart periodEnd revenue.totalRevenue netIncome fileName validationErrors createdAt')
            .sort({ createdAt: -1 });
        console.log('Fetched income statements:', incomeStatements.length);

        res.status(200).json(incomeStatements);
    } catch (error) {
        console.error('ListIncomeStatements Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete Income Statement
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('DELETE /api/income-statement/:id called', { id });

    try {
        // Find income statement
        const incomeStatement = await IncomeStatement.findById(id);
        if (!incomeStatement) {
            console.log('Income statement not found:', id);
            return res.status(404).json({ message: 'Income statement not found' });
        }

        // Delete the PDF file
        try {
            const filePath = path.join(reportsDir, incomeStatement.fileName);
            await fsPromises.unlink(filePath);
            console.log('PDF file deleted:', filePath);
        } catch (fileError) {
            console.error('Error deleting PDF file:', fileError);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await IncomeStatement.findByIdAndDelete(id);
        console.log('Income statement deleted from database:', id);

        res.status(200).json({ message: 'Income statement deleted successfully' });
    } catch (error) {
        console.error('DeleteIncomeStatement Error:', {
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