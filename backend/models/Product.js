const mongoose = require('mongoose');

const TVA_RATES = {
    'TVA19': 19,
    'TVA13': 13,
    'TVA7': 7,
    'Exonéré': 0
};

const productSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['Goods', 'Service'], 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    unit: { 
        type: String, 
        required: true 
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salesInfo: {
        sellingPrice: { 
            type: Number, 
            required: true, 
            min: [0, 'Selling price must be a positive number'] 
        },
        description: { 
            type: String,
            default: ''
        },
        taxCategory: { 
            type: String, 
            enum: Object.keys(TVA_RATES),
            required: true,
            default: 'TVA19'
        },
        tax: { 
            type: Number,
            default: function() {
                return TVA_RATES[this.taxCategory] || TVA_RATES['TVA19'];
            }
        }
    },

    purchaseInfo: {
        costPrice: { 
            type: Number, 
            required: true, 
            min: [0, 'Cost price must be a positive number'] 
        },
        description: { 
            type: String,
            default: ''
        },
        taxCategory: { 
            type: String, 
            enum: Object.keys(TVA_RATES),
            required: true,
            default: 'TVA19'
        },
        tax: { 
            type: Number,
            default: function() {
                return TVA_RATES[this.taxCategory] || TVA_RATES['TVA19'];
            }
        }
    }
}, { timestamps: true });

// Pre-save middleware to automatically set tax based on taxCategory
productSchema.pre('save', function(next) {
    if (this.isModified('salesInfo.taxCategory') || !this.salesInfo.tax) {
        this.salesInfo.tax = TVA_RATES[this.salesInfo.taxCategory];
    }
    if (this.isModified('purchaseInfo.taxCategory') || !this.purchaseInfo.tax) {
        this.purchaseInfo.tax = TVA_RATES[this.purchaseInfo.taxCategory];
    }
    next();
});

// Pre-validate middleware to ensure tax rates match their categories
productSchema.pre('validate', function(next) {
    if (this.salesInfo.tax !== TVA_RATES[this.salesInfo.taxCategory]) {
        this.salesInfo.tax = TVA_RATES[this.salesInfo.taxCategory];
    }
    if (this.purchaseInfo.tax !== TVA_RATES[this.purchaseInfo.taxCategory]) {
        this.purchaseInfo.tax = TVA_RATES[this.purchaseInfo.taxCategory];
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;