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
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    updatedAt: Date
});

// Check if the model is already compiled
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
