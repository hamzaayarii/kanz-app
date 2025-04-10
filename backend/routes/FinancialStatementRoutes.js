const express = require('express');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const TaxReport = require('../models/TaxReport');
const DailyRevenue = require('../models/DailyRevenue');
const FinancialStatement = require('../models/FinancialStatement');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/generate-financial-statement', authenticate, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { businessId, from, to } = req.query;

        if (!businessId || !from || !to) {
            return res.status(400).json({ message: 'Missing businessId, from or to date.' });
        }

        const periodStart = new Date(from);
        const periodEnd = new Date(to);

        if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        // Fetch financial data within the period
        const revenues = await DailyRevenue.find({
            userId,
            businessId,
            date: { $gte: periodStart, $lte: periodEnd }
        }).sort({ date: -1 });

        const taxReports = await TaxReport.find({
            userId,
            businessId,
            createdAt: { $gte: periodStart, $lte: periodEnd }
        }).sort({ year: -1 });

        const totalRevenue = revenues.reduce((acc, rev) => acc + rev.amount, 0);
        const totalExpenses = revenues.reduce((acc, rev) => acc + rev.expenses, 0);
        const profitLoss = totalRevenue - totalExpenses;

        const financialData = {
            totalRevenue,
            totalExpenses,
            profitLoss,
            taxData: taxReports.map(report => ({
                income: report.income,
                expenses: report.expenses,
                calculatedTax: report.calculatedTax,
                year: report.year
            }))
        };

        const fileName = `financial-statement-${uuidv4()}.pdf`;
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        const filePath = path.join(uploadDir, fileName);

        const doc = new pdfkit();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add header
        doc.fontSize(18).font('Helvetica-Bold').text('Financial Statement', { align: 'center' });
        doc.moveDown(1);

        // Business Info Section
        doc.fontSize(12).text(`Business ID: ${businessId}`, { align: 'center' });
        doc.text(`Period: ${from} to ${to}`, { align: 'center' });
        doc.moveDown(2);

        // Financial Overview Section
        doc.fontSize(14).font('Helvetica-Bold').text('Financial Overview', { underline: true });
        doc.moveDown(0.5);

        // Financial Table
        const tableStartX = 50;
        let tableStartY = doc.y;

        // Add Column Titles
        doc.fontSize(12).font('Helvetica').text('Description', tableStartX, tableStartY);
        doc.text('Amount (USD)', tableStartX + 300, tableStartY);
        tableStartY += 20;

        // Add Data Rows
        doc.text('Total Revenue', tableStartX, tableStartY);
        doc.text(`${totalRevenue} USD`, tableStartX + 300, tableStartY);
        tableStartY += 20;

        doc.text('Total Expenses', tableStartX, tableStartY);
        doc.text(`${totalExpenses} USD`, tableStartX + 300, tableStartY);
        tableStartY += 20;

        doc.text('Profit/Loss', tableStartX, tableStartY);
        doc.text(`${profitLoss} USD`, tableStartX + 300, tableStartY);
        tableStartY += 30; // add some space after financial overview section

        doc.moveDown(1).text('---');

        // Tax Report Section
        doc.fontSize(14).font('Helvetica-Bold').text('Tax Reports', { underline: true });
        doc.moveDown(0.5);

        // Add Column Titles for Tax Reports
        const taxTableStartX = 50;
        let taxTableStartY = doc.y;
        doc.text('Year', taxTableStartX, taxTableStartY);
        doc.text('Income (USD)', taxTableStartX + 100, taxTableStartY);
        doc.text('Expenses (USD)', taxTableStartX + 250, taxTableStartY);
        doc.text('Calculated Tax (USD)', taxTableStartX + 400, taxTableStartY);
        taxTableStartY += 20;

        // Add Tax Report Rows
        taxReports.forEach((report) => {
            doc.text(report.year, taxTableStartX, taxTableStartY);
            doc.text(`${report.income} USD`, taxTableStartX + 100, taxTableStartY);
            doc.text(`${report.expenses} USD`, taxTableStartX + 250, taxTableStartY);
            doc.text(`${report.calculatedTax} USD`, taxTableStartX + 400, taxTableStartY);
            taxTableStartY += 20;
        });

        const footerYPosition = 750;
        if (doc.y > footerYPosition - 20) {
            doc.addPage();
        }

        // Footer
        doc.fontSize(8).text('Generated on: ' + new Date().toLocaleDateString(), 50, 750, { align: 'left' });
        doc.text('Page 1 of 1', 450, 750, { align: 'right' });

        doc.end();

        writeStream.on('finish', async () => {
            const statement = new FinancialStatement({
                businessId,
                userId,
                type: 'income_statement',
                periodStart,
                periodEnd,
                data: financialData,
                fileUrl: `/uploads/${fileName}`,
                fileName,
                createdAt: new Date(),
            });

            await statement.save();

            return res.status(200).json(statement);
        });

    } catch (err) {
        console.error("Error generating financial statement:", err);
        return res.status(500).json({ message: "Failed to generate financial statement." });
    }
});


router.get('/list', authenticate, async (req, res) => {
    try {
        const { businessId } = req.query;

        if (!businessId) {
            return res.status(400).json({ message: 'Missing businessId.' });
        }


        const statements = await FinancialStatement.find({ businessId }).sort({ createdAt: -1 });

        return res.status(200).json(statements);
    } catch (err) {
        console.error("Error fetching financial statement list:", err);
        return res.status(500).json({ message: "Failed to fetch statements." });
    }
});

router.get('/download/:reportId', async (req, res) => {
    try {
        const reportId = req.params.reportId;

        const report = await FinancialStatement.findById(reportId);
        console.log(report);
        if (!report) return res.status(404).json({ message: "Report not found." });

        const filePath = path.resolve(__dirname, '..', 'uploads', report.fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server." });
        }
        // Set headers and send file
        res.download(filePath, `financial-statement-${reportId}.pdf`);
    } catch (err) {
        console.error('Error in download:', err);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.id;

        const report = await FinancialStatement.findOneAndDelete({ _id: id, userId });
        if (!report) {
            return res.status(404).json({ message: 'Financial report not found or not authorized.' });
        }

        // Ensure fileUrl exists before attempting to delete the file
        if (report.fileUrl) {
            const filePath = path.join(__dirname, '../uploads', report.fileUrl.split('/uploads/')[1]);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                console.log("File not found:", filePath);  // Log if file doesn't exist
            }
        } else {
            console.log("No file URL associated with this report.");
        }

        return res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (error) {
        console.error('Delete report error:', error);
        return res.status(500).json({ message: 'Error deleting report.' });
    }
});


module.exports = router;


