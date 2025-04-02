const mongoose = require('mongoose');

// Define valid account types based on Tunisian Chart of Accounts
const ACCOUNT_TYPES = {
    '1': 'CAPITAL_ACCOUNTS',      // Comptes de capitaux
    '2': 'FIXED_ASSETS',         // Comptes d'immobilisations
    '3': 'INVENTORY_ACCOUNTS',   // Comptes de stocks
    '4': 'THIRD_PARTY',         // Comptes de tiers
    '5': 'FINANCIAL_ACCOUNTS',   // Comptes financiers
    '6': 'EXPENSES',            // Comptes de charges
    '7': 'REVENUE'              // Comptes de produits
};

const journalEntrySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    pieceNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Format: JE-YYYY-XXXXX (e.g., JE-2024-00001)
                return /^JE-\d{4}-\d{5}$/.test(v);
            },
            message: 'Piece number must follow format: JE-YYYY-XXXXX'
        }
    },
    entries: [{
        accountNumber: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    // Validate against Tunisian chart of accounts format (X to XXXXX)
                    return /^\d{1,5}$/.test(v);
                },
                message: 'Invalid account number format'
            }
        },
        accountName: {
            type: String,
            required: true
        },
        accountType: {
            type: String,
            enum: Object.values(ACCOUNT_TYPES),
            required: true
        },
        debit: {
            type: Number,
            default: 0,
            min: 0
        },
        credit: {
            type: Number,
            default: 0,
            min: 0
        },
        description: String
    }],
    totalDebit: {
        type: Number,
        required: true,
        min: 0
    },
    totalCredit: {
        type: Number,
        required: true,
        min: 0
    },
    isBalanced: {
        type: Boolean,
        required: true,
        default: false
    },
    reference: {
        type: {
            type: String,
            enum: ['INVOICE', 'PURCHASE', 'MANUAL', 'DAILY_REVENUE', 'OTHER'],
            required: true
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        }
    },
    description: {
        type: String,
        required: true
    },
    attachments: [{
        filename: String,
        path: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['DRAFT', 'POSTED', 'VERIFIED'],
        default: 'DRAFT'
    },
    fiscalYear: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}$/.test(v);
            },
            message: 'Fiscal year must be in YYYY format'
        }
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate totals and check balance
journalEntrySchema.pre('save', function(next) {
    this.totalDebit = this.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    this.totalCredit = this.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01; // Allow for small rounding differences
    next();
});

// Validate that each entry has either debit or credit but not both
journalEntrySchema.path('entries').validate(function(entries) {
    return entries.every(entry => {
        const hasDebit = entry.debit > 0;
        const hasCredit = entry.credit > 0;
        return (hasDebit && !hasCredit) || (!hasDebit && hasCredit);
    });
}, 'Each entry must have either debit or credit, but not both');

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
module.exports = JournalEntry; 