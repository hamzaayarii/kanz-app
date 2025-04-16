const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middlewares/authMiddleware');
const TaxReport = require('../models/TaxReport');
const DailyRevenue = require('../models/DailyRevenue');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Payroll = require('../models/Payroll');
const FinancialStatement = require('../models/FinancialStatement');

const router = express.Router();



router.get('/generate-financial-statement', authenticate, async (req, res) => {
    const userId = req.user._id;
    const { businessId, from, to } = req.query;

    if (!businessId || !from || !to) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    try {
        const [taxReports, revenues, expenses, invoices, payrolls] = await Promise.all([
            TaxReport.find({ userId, businessId, createdAt: { $gte: startDate, $lte: endDate } }),
            DailyRevenue.find({ userId, businessId, date: { $gte: startDate, $lte: endDate } }),
            Expense.find({ userId, businessId, date: { $gte: startDate, $lte: endDate } }),
            Invoice.find({ userId, businessId, date: { $gte: startDate, $lte: endDate } }),
            Payroll.find({ userId, businessId, createdAt: { $gte: startDate, $lte: endDate } })
        ]);

        const totalRevenue = revenues.reduce((acc, r) => acc + r.amount, 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
        const totalPayroll = payrolls.reduce((acc, p) => acc + p.totalAmount, 0);
        const totalInvoices = invoices.reduce((acc, inv) => acc + inv.total, 0);
        const totalTax = taxReports.reduce((acc, r) => acc + r.calculatedTax, 0);

        const profit = totalRevenue - (totalExpenses + totalPayroll + totalTax);

        const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
        const reportsDir = path.join(__dirname, '..', 'uploads', 'financial-reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

        const fileName = `financial-statement-${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Replace 'fr-FR' by 'en-GB' or use default 'en-US' if needed
        const formatDate = (d) => new Date(d).toLocaleDateString('en-GB');
        const formatCurrency = (n) => `${Number(n).toFixed(2)} TND`;

// Header
        doc.rect(0, 0, 612, 90).fill('#4facfe');
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('Complete Financial Report', 50, 30);
        doc.fontSize(10).font('Helvetica')
            .text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, 400, 65, { align: 'right' });
        doc.moveDown(4);

// Summary
        doc.fillColor('#333').fontSize(14).font('Helvetica-Bold').text('Overall Summary:', 50);
        doc.moveDown(0.5).fontSize(12).font('Helvetica').fillColor('#000')
            .text(`Total Revenue (Daily): ${formatCurrency(totalRevenue)}`)
            .text(`Total Invoices: ${formatCurrency(totalInvoices)}`)
            .text(`Total Expenses: ${formatCurrency(totalExpenses)}`)
            .text(`Payroll: ${formatCurrency(totalPayroll)}`)
            .text(`Taxes: ${formatCurrency(totalTax)}`)
            .text(`Net Profit: ${formatCurrency(profit)}`);
        doc.moveDown(2);

// Detailed Sections
        const addSection = (title, items, formatter) => {
            doc.addPage();
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(title, 50);
            doc.moveDown(1);
            items.forEach((item, i) => {
                doc.fontSize(11).font('Helvetica').fillColor('#000')
                    .text(`${i + 1}. ${formatter(item)}`, { continued: false });
            });
        };

        if (expenses.length)
            addSection('Expenses', expenses, e => `${formatDate(e.date)} - ${e.category}: ${formatCurrency(e.amount)}`);

        if (invoices.length)
            addSection('Invoices', invoices, i => `${formatDate(i.date)} - Client: ${i.clientName || 'N/A'}, Total: ${formatCurrency(i.total)}`);

        if (payrolls.length)
            addSection('Payrolls', payrolls, p => `Period: ${formatDate(p.createdAt)} - Employees Paid: ${p.employees.length}, Total: ${formatCurrency(p.totalAmount)}`);

        if (taxReports.length)
            addSection('Tax Reports', taxReports, r => `Year ${r.year} - Income: ${formatCurrency(r.income)}, Expenses: ${formatCurrency(r.expenses)}, Tax: ${formatCurrency(r.calculatedTax)}`);

        doc.moveDown(2);
        doc.fontSize(10).fillColor('#888').text('Document generated automatically.', 50, 750, { align: 'center' });

        doc.end();

        writeStream.on('finish', async () => {
            try {
                const statement = await FinancialStatement.create({
                    userId,
                    businessId,
                    periodStart: startDate,
                    periodEnd: endDate,
                    type: 'complete_financial_statement',
                    fileName,
                    data: {
                        totalRevenue,
                        totalExpenses,
                        totalInvoices,
                        totalPayroll,
                        totalTax,
                        profit,
                        counts: {
                            expenses: expenses.length,
                            invoices: invoices.length,
                            payrolls: payrolls.length,
                            taxReports: taxReports.length
                        }
                    }
                });

                res.status(200).json({
                    message: 'Rapport généré et sauvegardé avec succès.',
                    statementId: statement._id,
                    downloadUrl: `/uploads/financial-reports/${fileName}`
                });
            } catch (err) {
                console.error('Erreur DB:', err);
                res.status(500).json({ message: 'Erreur lors de la sauvegarde du rapport.', error: err.message });
            }
        });

        writeStream.on('error', (err) => {
            console.error('Erreur PDF:', err);
            res.status(500).json({ message: 'Erreur lors de la génération du PDF', error: err.message });
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
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
        if (!report) return res.status(404).json({ message: "Report not found." });

        const filePath = path.resolve(__dirname, '..', 'uploads', 'financial-reports', report.fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server." });
        }

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


