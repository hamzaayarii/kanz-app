const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User Schema
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: String,
    governorate: String,
    avatar: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
        default: 'Other'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    token: String,
    resetToken: String,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    updatedAt: Date,
    isBanned: {
        type: Boolean,
        default: false // Attribut pour gérer l'état de ban
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user' // Rôle de l'utilisateur : admin ou user
    }
});

// Vérifier si le modèle est déjà compilé
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Exporter le modèle User
module.exports = User;
