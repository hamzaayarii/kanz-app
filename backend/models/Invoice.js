const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemDetails: {
        type: String,
        required: [true, 'La description de l\'article est requise'],
        trim: true,
        minlength: [1, 'La description de l\'article ne peut pas être vide'],
        maxlength: [200, 'La description de l\'article ne doit pas dépasser 200 caractères']
    },
    quantity: {
        type: Number,
        required: [true, 'La quantité est requise'],
        min: [0, 'La quantité ne peut pas être négative'],
        default: 1
    },
    rate: {
        type: Number,
        required: [true, 'Le taux est requis'],
        min: [0, 'Le taux ne peut pas être négatif'],
        default: 0
    },
    taxPercentage: {
        type: Number,
        default: 0,
        min: [0, 'La taxe ne peut pas être négative'],
        max: [100, 'La taxe ne peut pas dépasser 100%']
    },
    amount: {
        type: Number,
        min: [0, 'Le montant ne peut pas être négatif'],
        default: 0
    }
});

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'ID utilisateur est requis']
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: [true, 'L\'ID de la société est requis']
    },
    invoiceNumber: {
        type: String,
        required: [true, 'Le numéro de facture est requis'],
        trim: true,
        match: [/^[A-Za-z0-9-]+$/, 'Le numéro de facture doit être alphanumérique avec des tirets uniquement'],
        index: true
    },
    orderNumber: {
        type: String,
        trim: true,
        default: null
    },
    invoiceDate: {
        type: Date,
        required: [true, 'La date de facture est requise']
    },
    dueDate: {
        type: Date,
        required: [true, 'La date d\'échéance est requise'],
        validate: {
            validator: function(v) {
                return v >= this.invoiceDate;
            },
            message: 'La date d\'échéance doit être postérieure ou égale à la date de facture'
        }
    },
    customerName: {
        type: String,
        required: [true, 'Le nom du client est requis'],
        trim: true,
        minlength: [1, 'Le nom du client ne peut pas être vide'],
        maxlength: [100, 'Le nom du client ne doit pas dépasser 100 caractères']
    },
    items: {
        type: [itemSchema],
        required: [true, 'La liste des articles est requise'],
        validate: [array => array.length > 0, 'La facture doit contenir au moins un article']
    },
    subTotal: {
        type: Number,
        required: true,
        min: [0, 'Le sous-total ne peut pas être négatif'],
        default: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'La remise ne peut pas être négative']
    },
    shippingCharges: {
        type: Number,
        default: 0,
        min: [0, 'Les frais de livraison ne peuvent pas être négatifs']
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Le total ne peut pas être négatif'],
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'cancelled'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Pre-save hook to calculate amounts and totals
invoiceSchema.pre('save', function(next) {
    try {
        this.items.forEach(item => {
            const baseAmount = (item.quantity || 0) * (item.rate || 0);
            const taxAmount = baseAmount * ((item.taxPercentage || 0) / 100);
            item.amount = Number((baseAmount + taxAmount).toFixed(2));
        });

        const subTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        this.subTotal = Number(subTotal.toFixed(2));
        this.total = Number((this.subTotal - (this.discount || 0) + (this.shippingCharges || 0)).toFixed(2));

        if (this.total < 0) {
            return next(new Error('Le total de la facture ne peut pas être négatif'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-update hook for findOneAndUpdate
invoiceSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        const doc = await this.model.findOne(this.getQuery());

        const items = update.items || doc.items;
        const discount = update.discount ?? doc.discount;
        const shippingCharges = update.shippingCharges ?? doc.shippingCharges;

        if (update.items) {
            items.forEach(item => {
                const baseAmount = (item.quantity || 0) * (item.rate || 0);
                const taxAmount = baseAmount * ((item.taxPercentage || 0) / 100);
                item.amount = Number((baseAmount + taxAmount).toFixed(2));
            });
        }

        const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const total = Number((subTotal - (discount || 0) + (shippingCharges || 0)).toFixed(2));

        if (total < 0) {
            return next(new Error('Le total de la facture ne peut pas être négatif après mise à jour'));
        }

        this.set({ subTotal, total, updatedAt: new Date() });
        next();
    } catch (error) {
        next(error);
    }
});

// Compound index for uniqueness of invoiceNumber within a business
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

// Additional indexes for performance
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ businessId: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
