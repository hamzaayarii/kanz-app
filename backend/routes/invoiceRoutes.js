const express = require('express');
const Business = require('../models/Business');
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const { authenticate } = require('../middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const vision = require('@google-cloud/vision');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

const router = express.Router();
const client = new vision.ImageAnnotatorClient();
const tokenizer = new natural.WordTokenizer();

router.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Seuls les fichiers PDF, JPEG, JPG et PNG sont autorisés'));
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error('Server error:', err.stack);
        res.status(err.status || 500).json({
            message: err.message || 'Erreur serveur interne',
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    });

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

const extractTextFromDocument = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        const error = new Error('Le fichier uploadé est introuvable sur le serveur');
        error.status = 400;
        throw error;
    }

    try {
        const [result] = await client.annotateImage({
            image: { source: { filename: filePath } },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            imageContext: { languageHints: ['fr', 'en'] }
        });

        let text = result.fullTextAnnotation?.text || '';
        if (text.trim()) {
            console.log('Text extracted using Google Cloud Vision:', text);
            return text;
        }

        if (path.extname(filePath).toLowerCase() === '.pdf') {
            try {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                text = data.text;
                if (text.trim()) {
                    console.log('Text extracted using pdf-parse:', text);
                    return text;
                }
            } catch (pdfError) {
                console.error('pdf-parse failed:', pdfError.message);
                const [fallbackResult] = await client.documentTextDetection({
                    image: { source: { filename: filePath } }
                });
                text = fallbackResult.fullTextAnnotation?.text || '';
                if (text.trim()) {
                    console.log('Text extracted using Vision API fallback:', text);
                    return text;
                }
            }
        }

        if (!text.trim()) {
            const error = new Error('Aucun texte détecté dans le document');
            error.status = 400;
            throw error;
        }
        return text;
    } catch (error) {
        throw new Error(`Erreur lors de l'extraction du texte : ${error.message}`);
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const sanitizeInvoiceData = (data) => {
    return {
        ...data,
        invoiceNumber: data.invoiceNumber?.toString().trim() || null,
        orderNumber: data.orderNumber?.toString().trim() || null,
        customerName: data.customerName?.trim() || null,
        customerNotes: data.customerNotes?.trim() || null,
        items: Array.isArray(data.items) ? data.items.map(item => ({
            itemDetails: item.itemDetails?.trim() || '',
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            taxPercentage: Number(item.taxPercentage) || 0,
            amount: Number(item.amount) || 0
        })) : [],
        subTotal: Number(data.subTotal) || 0,
        discount: Number(data.discount) || 0,
        shippingCharges: Number(data.shippingCharges) || 0,
        total: Number(data.total) || 0,
        calculatedTotal: data.calculatedTotal ? Number(data.calculatedTotal) : undefined
    };
};

const parseInvoiceText = (text) => {
    const invoiceData = {
        invoiceNumber: null,
        orderNumber: null,
        invoiceDate: null,
        dueDate: null,
        customerName: null,
        items: [],
        subTotal: 0.0,
        discount: 0.0,
        shippingCharges: 0.0, // Fixed typo from shippingACharges
        total: 0.0,
        customerNotes: null
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    console.log('Extracted lines:', lines);

    const invoiceNumberPatterns = [
        /Facture\s*[#:]\s*([A-Za-z0-9-]+)/i,
        /Invoice\s*[#:]\s*([A-Za-z0-9-]+)/i,
        /Numéro\s*de\s*facture\s*[:=]\s*([A-Za-z0-9-]+)/i
    ];
    const orderNumberPatterns = [
        /Numéro\s*de\s*commande\s*[:=]\s*([A-Za-z0-9-]+)/i,
        /Commande\s*[#:]\s*([A-Za-z0-9-]+)/i
    ];
    const customerPatterns = [
        /Destinataire\s*[:=]?\s*(.*)/i,
        /Client\s*[:=]?\s*(.+?)(?:\-\n|$)/i,
        /À\s*[:=]?\s*(.+?)(?:\n|$)/i,
        /Customer\s*[:=]?\s*(.+?)(?:\n|$)/i
    ];
    const datePatterns = [
        /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/,
        /\d{2,4}[/-]\d{1,2}[/-]\d{1,2}/,
        /\d{1,2}\s\w+\s\d{4}/,
        /\d{1,2}\.\d{1,2}\.\d{2,4}/
    ];
    const totalPatterns = [
        /Total\s*[:=]?\s*(\d+[.,]?\d*)/i,
        /Montant\s*total\s*[:=]?\s*(\d+[.,]?\d*)/i,
        /Grand\s*Total\s*[:=]?\s*(\d+[.,]?\d*)/i
    ];
    const customerNotesPatterns = [
        /Notes\s*client\s*[:=]\s*(.+?)(?:\n|$)/i,
        /Commentaires\s*[:=]\s*(.+?)(?:\n|$)/i,
        /Notes\s*[:=]\s*(.+?)(?:\n|$)/i,
        /Conditions\s*de\s*paiement\s*[:=]\s*(.+?)(?:\n|$)/i
    ];

    // Parse single-line fields
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!invoiceData.invoiceNumber) {
            for (const pattern of invoiceNumberPatterns) {
                const match = line.match(pattern);
                if (match) {
                    invoiceData.invoiceNumber = match[1];
                    console.log('Matched invoiceNumber:', match[1]);
                    break;
                }
            }
        }

        for (const pattern of orderNumberPatterns) {
            const match = line.match(pattern);
            if (match) {
                invoiceData.orderNumber = match[1];
                console.log('Matched orderNumber:', match[1]);
                break;
            }
        }

        for (const pattern of customerPatterns) {
            const match = line.match(pattern);
            if (match && !invoiceData.customerName) {
                const customerValue = match[1].trim();
                if (customerValue === '' && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine && !nextLine.match(/Détails de la facture/i)) {
                        invoiceData.customerName = nextLine;
                        console.log('Matched customerName (next line):', invoiceData.customerName);
                    }
                } else if (customerValue) {
                    invoiceData.customerName = customerValue;
                    console.log('Matched customerName:', customerValue);
                }
                break;
            }
        }

        for (const pattern of datePatterns) {
            const dates = line.match(pattern);
            if (dates) {
                const parseDate = (dateStr) => {
                    let parts = dateStr.split(/[\/\-\.]/);
                    if (parts.length !== 3) return null;
                    let [day, month, year] = parts.map(part => parseInt(part, 10));
                    if (year < 100) year += 2000;
                    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
                    const date = new Date(year, month - 1, day);
                    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
                };
                const parsedDate = parseDate(dates[0]);
                if (parsedDate) {
                    if (line.toLowerCase().includes('émission') && !invoiceData.invoiceDate) {
                        invoiceData.invoiceDate = parsedDate;
                        console.log('Matched invoiceDate:', invoiceData.invoiceDate);
                    } else if (line.toLowerCase().includes('échéance') && !invoiceData.dueDate) {
                        invoiceData.dueDate = parsedDate;
                        console.log('Matched dueDate:', invoiceData.dueDate);
                    }
                }
            }
        }

        for (const pattern of totalPatterns) {
            const match = line.match(pattern);
            if (match) {
                invoiceData.total = parseFloat(match[1].replace(',', '.'));
                console.log('Matched total:', invoiceData.total);
                break;
            }
        }
        if (/Sous-total|Subtotal/i.test(line) && !/Grand/i.test(line)) {
            const match = line.match(/(\d+[.,]?\d*)/);
            if (match) {
                invoiceData.subTotal = parseFloat(match[1].replace(',', '.'));
                console.log('Matched subTotal:', invoiceData.subTotal);
            }
        }
        if (/Remise|Discount/i.test(line)) {
            const match = line.match(/(\d+[.,]?\d*)/);
            if (match) {
                invoiceData.discount = parseFloat(match[1].replace(',', '.'));
                console.log('Matched discount:', invoiceData.discount);
            }
        }
        if (/Frais\s*de\s*livraison|Shipping/i.test(line)) {
            const match = line.match(/(\d+[.,]?\d*)/);
            if (match) {
                invoiceData.shippingCharges = parseFloat(match[1].replace(',', '.'));
                console.log('Matched shippingCharges:', invoiceData.shippingCharges);
            }
        }

        for (const pattern of customerNotesPatterns) {
            const match = line.match(pattern);
            if (match) {
                const cleanedNotes = match[1].trim().replace(/Page \d+ de \d+/i, '').trim();
                invoiceData.customerNotes = cleanedNotes;
                console.log('Matched customerNotes:', cleanedNotes);
                break;
            }
        }
    }

    // Improved item parsing
    let itemSection = false;
    const itemPattern = /details\s*:\s*-\s*([^:]+):\s*Quantité\s*=\s*(\d+),\s*Prix\s*unitaire\s*=\s*(\d+[.,]?\d*)\s*TND,\s*Taxe\s*=\s*(\d+[.,]?\d*)\s*TND,\s*Montant\s*=\s*(\d+[.,]?\d*)\s*TND/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/Articles:/i.test(line)) {
            itemSection = true;
            console.log('Detected item section start');
            continue;
        }

        if (itemSection && !/Résumé des coûts|Sous-total|Subtotal|Remise|Discount|Shipping|Frais|Total|Merci|Conditions/i.test(line)) {
            const match = line.match(itemPattern);
            if (match) {
                const [, itemDetails, quantity, rate, taxAmount, amount] = match;
                const qty = parseFloat(quantity) || 1;
                const rt = parseFloat(rate.replace(',', '.')) || 0;
                const taxAmt = parseFloat(taxAmount.replace(',', '.')) || 0;
                const amt = parseFloat(amount.replace(',', '.')) || 0;

                // Calculate taxPercentage from taxAmount
                const baseAmount = qty * rt;
                const taxPercentage = baseAmount > 0 ? (taxAmt / baseAmount) * 100 : 0;

                const item = {
                    itemDetails: itemDetails.trim(),
                    quantity: qty,
                    rate: rt,
                    taxPercentage: Number(taxPercentage.toFixed(2)),
                    amount: amt
                };

                // Verify calculation
                const calculatedAmount = Number((baseAmount + taxAmt).toFixed(2));
                if (Math.abs(item.amount - calculatedAmount) > 0.01) {
                    console.warn(`Item amount mismatch for ${item.itemDetails}: Calculated ${calculatedAmount}, PDF ${item.amount}`);
                    item.amount = calculatedAmount;
                }

                invoiceData.items.push(item);
                console.log('Parsed item:', item);
            }
        }
    }

    // Validate totals
    const calculatedSubTotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const calculatedTotal = Number((calculatedSubTotal - (invoiceData.discount || 0) + (invoiceData.shippingCharges || 0)).toFixed(2));

    if (Math.abs(calculatedTotal - invoiceData.total) > 0.01) {
        console.warn('Total mismatch: Calculated total is', calculatedTotal, 'but PDF total is', invoiceData.total);
        invoiceData.calculatedTotal = calculatedTotal;
        invoiceData.total = calculatedTotal; // Override with calculated total
    } else {
        invoiceData.calculatedTotal = calculatedTotal;
    }

    const sanitizedData = sanitizeInvoiceData(invoiceData);
    console.log('Final parsed invoice data:', sanitizedData);
    return sanitizedData;
};

router.post('/extract', authenticate, upload.single('file'), asyncHandler(async (req, res) => {
    const { businessId } = req.body;
    console.log('/extract - User ID:', req.user.id);
    console.log('/extract - Business ID:', businessId);
    const business = await Business.findOne({ _id: businessId, owner: req.user._id });
    console.log('/extract - Found Business:', business);
    if (!business) {
        return res.status(403).json({ message: 'Société non trouvée ou non autorisée' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const filePath = req.file.path;
    const text = await extractTextFromDocument(filePath);
    const invoiceData = parseInvoiceText(text);
    invoiceData.businessId = businessId;

    res.status(200).json({
        message: 'Informations de la facture extraites avec succès',
        invoiceData
    });
}));

router.get('/:id/pdf', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('businessId');
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    try {
        const formatDate = (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            return d.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '/');
        };

        const formatCurrency = (value) => {
            return `${Number(value).toFixed(2)} TND`;
        };

        const addHeader = () => {
            doc.rect(0, 0, 612, 90).fill('#4facfe');
            doc.fillColor('white')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text(`Facture N° ${invoice.invoiceNumber || 'N/A'}`, 50, 30);
            doc.fillColor('#ffffff')
                .fontSize(10)
                .font('Helvetica')
                .text(invoice.businessId.name || 'N/A', 400, 20, { align: 'right' })
                .text(invoice.businessId.address || 'N/A', 400, 35, { align: 'right' })
                .text(`N° Taxe: ${invoice.businessId.taxNumber || 'N/A'}`, 400, 50, { align: 'right' })
                .text(`Date: ${formatDate(new Date())}`, 400, 65, { align: 'right' });
        };

        const addFooter = (currentPage, totalPages) => {
            doc.moveTo(50, 750).lineTo(562, 750).strokeColor('#ddd').stroke();
            doc.fillColor('#666')
                .fontSize(10)
                .font('Helvetica')
                .text('Merci pour votre confiance!', 306, 760, { align: 'center' })
                .text('Conditions de paiement: 30 jours net', 306, 775, { align: 'center' })
                .text(`Page ${currentPage} de ${totalPages}`, 562, 775, { align: 'right' });
        };

        let currentPage = 1;
        const itemsPerPage = 10;
        const totalPages = Math.ceil((invoice.items.length + 1) / itemsPerPage);

        addHeader();

        doc.moveDown(6)
            .fillColor('#333333')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Destinataire:', 50)
            .fontSize(12)
            .font('Helvetica')
            .text(invoice.customerName || 'N/A', 50, doc.y + 5)
            .moveDown(2);

        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('Détails de la facture:', 50)
            .fontSize(12)
            .font('Helvetica')
            .text(`Numéro de facture: ${invoice.invoiceNumber || 'N/A'}`, 50, doc.y + 5)
            .text(`Numéro de commande: ${invoice.orderNumber || 'N/A'}`, 50, doc.y + 10)
            .text(`Date d'émission: ${formatDate(invoice.invoiceDate)}`, 50, doc.y + 10)
            .text(`Date d'échéance: ${formatDate(invoice.dueDate)}`, 50, doc.y + 10)
            .moveDown(2);

        doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(1);

        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('Articles:', 50);
        let position = doc.y + 10;

        invoice.items.forEach((item, index) => {
            if (index > 0 && index % itemsPerPage === 0) {
                addFooter(currentPage, totalPages);
                doc.addPage();
                currentPage++;
                addHeader();
                position = doc.y;
            }

            const y = position + (index % itemsPerPage * 25);
            const truncatedDescription = item.itemDetails.length > 40
                ? item.itemDetails.split(' ').slice(0, -1).join(' ').substring(0, 40) + '...'
                : item.itemDetails;
            const taxAmount = (item.quantity * item.rate) * (item.taxPercentage / 100);

            doc.fillColor('#333333')
                .fontSize(11)
                .font('Helvetica')
                .text(`details: - ${truncatedDescription}: Quantité = ${item.quantity}, Prix unitaire = ${formatCurrency(item.rate)}, Taxe = ${formatCurrency(taxAmount)}, Montant = ${formatCurrency(item.amount)}`, 50, y, { width: 500 });

            if (index < invoice.items.length - 1) {
                doc.moveTo(50, y + 20).lineTo(562, y + 20).strokeColor('#ddd').dash(2, { space: 2 }).stroke();
            }
        });

        const lastItemPosition = position + (Math.min(invoice.items.length, itemsPerPage) * 25);
        let totalsTop = lastItemPosition + 30;

        if (totalsTop + 100 > 750) {
            addFooter(currentPage, totalPages);
            doc.addPage();
            currentPage++;
            addHeader();
            totalsTop = 100;
        }

        doc.moveTo(50, totalsTop).lineTo(562, totalsTop).strokeColor('#ddd').stroke();
        doc.moveDown(1)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Résumé des coûts:', 50, totalsTop + 10);

        const totalsData = [
            { label: 'Sous-total:', value: formatCurrency(invoice.subTotal) },
            { label: 'Remise:', value: formatCurrency(invoice.discount) },
            { label: 'Frais de livraison:', value: formatCurrency(invoice.shippingCharges) },
            { label: 'TOTAL:', value: formatCurrency(invoice.total), highlight: true }
        ];

        totalsData.forEach((row, index) => {
            const y = totalsTop + 30 + (index * 20);
            doc.fillColor(row.highlight ? '#4facfe' : '#333333')
                .fontSize(row.highlight ? 14 : 12)
                .font('Helvetica-Bold')
                .text(`${row.label} ${row.value}`, 50, y);
        });

        addFooter(currentPage, totalPages);
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Erreur lors de la génération du PDF', details: error.message });
    }
}));

router.post('/', authenticate, validateInvoiceInput, asyncHandler(async (req, res) => {
    const { businessId } = req.body;

    console.log('/invoices POST - User:', req.user);
    console.log('/invoices POST - Business ID:', businessId);
    console.log('/invoices POST - Full Body:', req.body); // Debug full request body
    const business = await Business.findOne({ _id: businessId, owner: req.user._id });
    console.log('/invoices POST - Found Business:', business);
    if (!business) {
        return res.status(403).json({ message: 'Société non trouvée ou non autorisée' });
    }

    const invoiceData = sanitizeInvoiceData({
        ...req.body,
        userId: req.user._id,
        businessId: businessId,
        createdAt: new Date()
    });

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json({ message: 'Facture créée avec succès', invoice });
}));

router.get('/', authenticate, asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-invoiceDate' } = req.query;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find({ userId: req.user._id })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('businessId', 'name');

    const total = await Invoice.countDocuments({ userId: req.user._id });

    res.json({
        invoices,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('businessId');
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }
    res.json({ invoice });
}));

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
        { ...sanitizeInvoiceData(req.body), updatedAt: new Date() },
        { new: true }
    );
    res.json({ message: 'Facture mise à jour avec succès', invoice: updatedInvoice });
}));

router.post('/import', authenticate, asyncHandler(async (req, res) => {
    const { invoices } = req.body;

    if (!Array.isArray(invoices) || invoices.length === 0) {
        return res.status(400).json({ message: 'Les données doivent être un tableau de factures non vide' });
    }

    const createdInvoices = [];
    for (const invoiceData of invoices) {
        const sanitizedData = sanitizeInvoiceData({
            ...invoiceData,
            userId: req.user.id,
            createdAt: new Date()
        });
        const invoice = new Invoice(sanitizedData);
        await invoice.save();
        createdInvoices.push(invoice);
    }

    res.status(201).json({ message: 'Factures importées avec succès', invoices: createdInvoices });
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ message: 'Facture non trouvée' });
    }
    if (invoice.userId.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Non autorisé' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facture supprimée avec succès' });
}));

module.exports = router;
