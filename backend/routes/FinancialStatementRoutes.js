const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const TaxReport = require('../models/TaxReport');
const DailyRevenue = require('../models/DailyRevenue');
const FinancialStatement = require('../models/FinancialStatement');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/generate-financial-statement', authenticate, async (req, res) => {
    const userId = req.user._id;
    const { businessId, from, to } = req.query;

    if (!businessId || !from || !to) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    const reports = await TaxReport.find({
        userId,
        businessId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const revenues = await DailyRevenue.find({
        userId,
        businessId,
        date: { $gte: startDate, $lte: endDate }
    });

    const totalRevenue = revenues.reduce((acc, rev) => acc + rev.amount, 0);
    const totalExpenses = revenues.reduce((acc, rev) => acc + rev.expenses, 0);
    const profit = totalRevenue - totalExpenses;

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

    const reportsDir = path.join(__dirname, '..', 'uploads', 'financial-reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const fileName = `income-statement-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
    const formatCurrency = (val) => `${Number(val).toFixed(2)} TND`;

    const addHeader = () => {
        doc.rect(0, 0, 612, 90).fill('#4facfe');
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('Rapport Financier', 50, 30);
        doc.fontSize(10).font('Helvetica')
            .text(`Période: ${formatDate(startDate)} au ${formatDate(endDate)}`, 400, 65, { align: 'right' });
    };

    const addFooter = (page, totalPages) => {
        doc.moveTo(50, 750).lineTo(562, 750).strokeColor('#ddd').stroke();
        doc.fillColor('#666').fontSize(10).font('Helvetica')
            .text('Document généré automatiquement.', 306, 760, { align: 'center' })
            .text(`Page ${page} de ${totalPages}`, 562, 775, { align: 'right' });
    };

    let currentPage = 1;
    let itemsPerPage = 10;
    let totalPages = Math.ceil(reports.length / itemsPerPage) || 1;

    addHeader();
    doc.moveDown(4).fontSize(14).font('Helvetica-Bold').fillColor('#333').text('Vue d’ensemble:', 50);
    doc.moveDown(0.5).font('Helvetica').fontSize(12)
        .text(`Revenu total: ${formatCurrency(totalRevenue)}`)
        .text(`Dépenses totales: ${formatCurrency(totalExpenses)}`)
        .text(`Profit: ${formatCurrency(profit)}`)
        .moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Rapports fiscaux:', 50);
    doc.moveDown(1);

    const startY = doc.y;
    reports.forEach((r, index) => {
        const y = startY + (index % itemsPerPage) * 25;
        if (index > 0 && index % itemsPerPage === 0) {
            addFooter(currentPage, totalPages);
            doc.addPage();
            currentPage++;
            addHeader();
            doc.moveDown(2);
        }
        doc.fontSize(12).font('Helvetica').fillColor('#000')
            .text(`Année: ${r.year} | Revenu: ${formatCurrency(r.income)} | Dépenses: ${formatCurrency(r.expenses)} | Taxe: ${formatCurrency(r.calculatedTax)}`, 50, y);
    });

    addFooter(currentPage, totalPages);
    doc.end();

    writeStream.on('finish', async () => {
        try {
            // Save to MongoDB (FinancialStatement)
            const statement = await FinancialStatement.create({
                userId,
                businessId,
                type: 'income_statement',
                periodStart: startDate,
                periodEnd: endDate,
                fileName,
                data: {
                    totalRevenue,
                    totalExpenses,
                    profit,
                    taxReports: reports.length,
                    dailyRevenues: revenues.length
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


