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

        doc.fontSize(18).text('Financial Statement', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Business ID: ${businessId}`);
        doc.text(`Period: ${from} to ${to}`);
        doc.text(`Total Revenue: ${totalRevenue} USD`);
        doc.text(`Total Expenses: ${totalExpenses} USD`);
        doc.text(`Profit/Loss: ${profitLoss} USD`);
        doc.moveDown().text('---');

        taxReports.forEach((report) => {
            doc.text(`Tax Report - Year: ${report.year}`);
            doc.text(`Income: ${report.income} USD`);
            doc.text(`Expenses: ${report.expenses} USD`);
            doc.text(`Calculated Tax: ${report.calculatedTax} USD`);
            doc.moveDown().text('---');
        });

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

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.id;

        const report = await FinancialStatement.findOneAndDelete({ _id: id, userId });

        if (!report) {
            return res.status(404).json({ message: 'Financial report not found or not authorized.' });
        }

        // Optionally delete the associated PDF file from the file system
        const filePath = path.join(__dirname, '../uploads', report.fileUrl?.split('/uploads/')[1]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (error) {
        console.error('Delete report error:', error);
        return res.status(500).json({ message: 'Error deleting report.' });
    }
});


module.exports = router;


