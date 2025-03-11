const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    taxNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Relation with User
}, {
    timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
