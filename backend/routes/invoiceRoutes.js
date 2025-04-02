const express = require('express');
const Business = require('../models/Business');
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const { authenticate } = require('../middlewares/authMiddleware');
require('dotenv').config();

const router = express.Router();

// Middleware de gestion d'erreurs async
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(err.stack);
        res.status(500).json({
            message: 'Erreur serveur interne',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

// Validation des données de facture
const validateInvoiceInput = (req, res, next) => {
    const { customerName, invoiceNumber, items, invoiceDate, dueDate } = req.body;

    if (!customerName || !invoiceNumber || !items || !invoiceDate || !dueDate) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'La liste des articles doit être un tableau non vide' });
    }

    for (const item of items) {
        if (!item.itemDetails || !item.quantity || !item.rate) {
            return res.status(400).json({ message: 'Chaque article doit avoir une description, une quantité et un taux' });
        }
        if (item.quantity < 0 || item.rate < 0) {
            return res.status(400).json({ message: 'La quantité et le taux doivent être positifs' });
        }
    }

    next();
};

// 📌 Générer un PDF pour une facture
router.get('/:id/pdf', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('businessId');
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }

    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        info: {
            Title: `Facture ${invoice.invoiceNumber}`,
            Author: invoice.businessId.name,
            Subject: 'Facture Client',
            CreationDate: new Date()
        }
    });

    // Définir les en-têtes pour le téléchargement du PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice.invoiceNumber}.pdf"`);

    // Pipe le PDF directement dans la réponse
    doc.pipe(res);

    // Ajouter les informations de la société dans l'en-tête du PDF
    const addHeader = () => {
        doc.rect(0, 0, 612, 80).fill('#4facfe');
        doc.fillColor('white')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(`Facture N° ${invoice.invoiceNumber}`, 50, 30);

        doc.fillColor('#ffffff')
            .fontSize(10)
            .font('Helvetica')
            .text(invoice.businessId.name, 400, 20, { align: 'right' })
            .text(invoice.businessId.address, 400, 35, { align: 'right' })
            .text(`N° Taxe: ${invoice.businessId.taxNumber}`, 400, 50, { align: 'right' });
    };

    const addFooter = (currentPage, totalPages) => {
        doc.moveTo(50, 700).lineTo(562, 700).strokeColor('#ddd').stroke();
        doc.fontSize(10)
            .fillColor('#666')
            .text('Merci pour votre confiance!', 50, 720, { align: 'center' })
            .text('Conditions de paiement: 30 jours net', 50, 735, { align: 'center' })
            .text(`Page ${currentPage} de ${totalPages}`, 562, 735, { align: 'right' });
    };

    let currentPage = 1;
    let totalPages = Math.ceil(invoice.items.length / 10) || 1;

    addHeader();

    doc.moveDown(6)
        .fillColor('#333333')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Destinataire:', 50)
        .font('Helvetica')
        .text(invoice.customerName, 130, doc.y - 15)
        .moveDown();

    doc.font('Helvetica-Bold')
        .text('Détails de la facture:', 50)
        .font('Helvetica')
        .text(`Numéro de facture: ${invoice.invoiceNumber}`, 50, doc.y + 5)
        .text(`Numéro de commande: ${invoice.orderNumber || 'N/A'}`, 50, doc.y + 5)
        .text(`Date d'émission: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}`, 50, doc.y + 5)
        .text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 50, doc.y + 5);

    doc.moveDown(2);
    const drawTableHeader = () => {
        const startX = 50;
        const startY = doc.y;
        const rowHeight = 25;
        const colWidths = [200, 60, 100, 70, 80];

        doc.rect(startX, startY, 512, rowHeight).fill('#f0f0f0');
        doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold');

        let currentX = startX + 5;
        doc.text('Description', currentX, startY + 8);
        currentX += colWidths[0];
        doc.text('Qté', currentX, startY + 8, { align: 'center' });
        currentX += colWidths[1];
        doc.text('Prix unitaire', currentX, startY + 8, { align: 'center' });
        currentX += colWidths[2];
        doc.text('Taxe', currentX, startY + 8, { align: 'center' });
        currentX += colWidths[3];
        doc.text('Montant', currentX, startY + 8, { align: 'center' });

        doc.moveTo(startX, startY).lineTo(startX + 512, startY).stroke();
        doc.moveTo(startX, startY + rowHeight).lineTo(startX + 512, startY + rowHeight).stroke();
        currentX = startX;
        colWidths.forEach(width => {
            doc.moveTo(currentX, startY).lineTo(currentX, startY + rowHeight).stroke();
            currentX += width;
        });
        doc.moveDown();
    };

    drawTableHeader();
    let position = doc.y + 25;
    const itemsPerPage = 10;
    invoice.items.forEach((item, index) => {
        if (index > 0 && index % itemsPerPage === 0) {
            addFooter(currentPage, totalPages);
            doc.addPage();
            currentPage++;
            addHeader();
            drawTableHeader();
            position = doc.y + 25;
        }

        const y = position + ((index % itemsPerPage) * 20);
        let currentX = 55;

        doc.fillColor('#333333')
            .fontSize(10)
            .font('Helvetica')
            .text(item.itemDetails.length > 40 ? item.itemDetails.substring(0, 40) + '...' : item.itemDetails, currentX, y, { width: 190 })
            .text(item.quantity.toString(), currentX + 200, y, { width: 60, align: 'center' })
            .text(`${item.rate.toFixed(2)} TND`, currentX + 260, y, { width: 100, align: 'right' })
            .text(item.tax ? `${item.tax.toFixed(2)} TND` : '0.00 TND', currentX + 360, y, { width: 70, align: 'right' })
            .text(`${item.amount.toFixed(2)} TND`, currentX + 430, y, { width: 80, align: 'right' });

        doc.moveTo(50, y + 15).lineTo(562, y + 15).strokeColor('#ddd').dash(2, { space: 2 }).stroke();
    });

    const lastItemPosition = position + ((invoice.items.length % itemsPerPage || itemsPerPage) * 20);
    let totalsTop = lastItemPosition + 20;

    if (totalsTop + 100 > 650) {
        addFooter(currentPage, totalPages);
        doc.addPage();
        currentPage++;
        addHeader();
        totalsTop = 100;
    }

    const totalsTableWidth = 250;
    const totalsTableLeft = 562 - totalsTableWidth;

    const totalsData = [
        { label: 'Sous-total', value: invoice.subTotal.toFixed(2) },
        { label: 'Remise', value: invoice.discount.toFixed(2) },
        { label: 'Frais de livraison', value: invoice.shippingCharges.toFixed(2) },
        { label: 'TOTAL', value: invoice.total.toFixed(2), highlight: true }
    ];

    totalsData.forEach((row, index) => {
        const y = totalsTop + (index * 20);
        doc.rect(totalsTableLeft, y, totalsTableWidth, 20)
            .fill(row.highlight ? '#e6f3ff' : '#f0f0f0');

        doc.fillColor(row.highlight ? '#4facfe' : '#333333')
            .fontSize(row.highlight ? 12 : 10)
            .font('Helvetica-Bold')
            .text(row.label, totalsTableLeft + 5, y + 5);

        doc.fillColor('#333333')
            .fontSize(10)
            .font('Helvetica')
            .text(`${row.value} TND`, totalsTableLeft + 180, y + 5, { width: 65, align: 'right' });

        doc.moveTo(totalsTableLeft, y + 20)
            .lineTo(totalsTableLeft + totalsTableWidth, y + 20)
            .strokeColor('#ddd')
            .stroke();
    });

    addFooter(currentPage, totalPages);
    doc.end();
}));

// 📌 Ajouter une facture
router.post('/', authenticate, validateInvoiceInput, asyncHandler(async (req, res) => {
    const { businessId } = req.body;

    const business = await Business.findOne({ _id: businessId, owner: req.user.id });
    if (!business) {
        return res.status(403).json({ message: 'Société non trouvée ou non autorisée' });
    }

    const invoiceData = {
        ...req.body,
        userId: req.user.id,
        businessId: businessId,
        createdAt: new Date()
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json({ message: 'Facture créée avec succès', invoice });
}));

// 📌 Récupérer toutes les factures de l'utilisateur
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ userId: req.user.id })
        .sort({ invoiceDate: -1 });
    res.json({ invoices });
}));

// 📌 Récupérer une facture par ID
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }
    res.json({ invoice });
}));

// 📌 Mettre à jour une facture
router.put('/:id', authenticate, validateInvoiceInput, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
    );
    res.json({ message: 'Facture mise à jour avec succès', invoice: updatedInvoice });
}));

// 📌 Importer des factures
router.post('/import', authenticate, asyncHandler(async (req, res) => {
    const { invoices } = req.body;

    if (!Array.isArray(invoices) || invoices.length === 0) {
        return res.status(400).json({ message: 'Les données doivent être un tableau de factures non vide' });
    }

    const createdInvoices = [];
    for (const invoiceData of invoices) {
        const invoice = new Invoice({
            ...invoiceData,
            userId: req.user.id,
            createdAt: new Date()
        });
        await invoice.save();
        createdInvoices.push(invoice);
    }

    res.status(201).json({ message: 'Factures importées avec succès', invoices: createdInvoices });
}));

// 📌 Supprimer une facture
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facture supprimée avec succès' });
}));

module.exports = router;