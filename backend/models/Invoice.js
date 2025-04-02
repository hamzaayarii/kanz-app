const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemDetails: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'La description de l\'article ne peut pas être vide'],
        maxlength: [200, 'La description de l\'article ne doit pas dépasser 200 caractères']
    },
    quantity: {
        type: Number,
        required: true,
        min: [0, 'La quantité ne peut pas être négative']
    },
    rate: {
        type: Number,
        required: true,
        min: [0, 'Le taux ne peut pas être négatif']
    },
    tax: {
        type: Number,
        default: 0,
        min: [0, 'La taxe ne peut pas être négative']
    },
    amount: {
        type: Number,

        min: [0, 'Le montant ne peut pas être négatif']
    }
});

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: { // Nouveau champ pour lier la facture à une société
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[A-Za-z0-9-]+$/, 'Le numéro de facture doit être alphanumérique avec des tirets uniquement']
    },
    orderNumber: {
        type: String,
        trim: true,
        default: null
    },
    invoiceDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v <= this.dueDate;
            },
            message: 'La date de facture doit être antérieure ou égale à la date d\'échéance'
        }
    },
    dueDate: {
        type: Date,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Le nom du client ne peut pas être vide'],
        maxlength: [100, 'Le nom du client ne doit pas dépasser 100 caractères']
    },
    items: [itemSchema],
    subTotal: {
        type: Number,
        required: true,
        min: [0, 'Le sous-total ne peut pas être négatif']
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
        min: [0, 'Le total ne peut pas être négatif']
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

// Pré-hook pour valider et calculer automatiquement les montants
invoiceSchema.pre('save', function(next) {
    // Calculer le montant de chaque article
    this.items.forEach(item => {
        item.amount = (item.quantity * item.rate) + (item.tax || 0);
    });

    // Calculer le sous-total
    this.subTotal = this.items.reduce((sum, item) => sum + item.amount, 0);

    // Calculer le total final
    this.total = this.subTotal - this.discount + this.shippingCharges;

    // Vérifier que le total n'est pas négatif après remise
    if (this.total < 0) {
        return next(new Error('Le total de la facture ne peut pas être négatif après application de la remise'));
    }

    next();
});

// Pré-hook pour mise à jour
invoiceSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();

    if (update.items) {
        update.items.forEach(item => {
            item.amount = (item.quantity * item.rate) + (item.tax || 0);
        });

        update.subTotal = update.items.reduce((sum, item) => sum + item.amount, 0);
        update.total = update.subTotal - (update.discount || this._update.discount || 0) +
            (update.shippingCharges || this._update.shippingCharges || 0);

        if (update.total < 0) {
            return next(new Error('Le total de la facture ne peut pas être négatif après mise à jour'));
        }
    }

    update.updatedAt = new Date();
    next();
});

// Index pour recherches fréquentes
invoiceSchema.index({ userId: 1, invoiceNumber: 1 });
invoiceSchema.index({ invoiceDate: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;