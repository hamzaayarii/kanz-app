const express = require('express');
const router = express.Router();
const { create, list, updateUser, deleteUser, googleAuth, googleAuthRequest, forgot_password, reset_password} = require('../controllers/userController');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load environment variables
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach user data to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// 📌 Register a new user
router.post('/register', create);

// 📌 Get all users (No authentication required)
router.get('/', list);

// 📌 Update user by ID (No authentication required, but validate for updates)
router.put('/:id', updateUser);

// 📌 Delete user by ID (No authentication required, but validate for deletion)
router.delete('/:id', deleteUser);

// 📌 User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 🔹 Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // 🔹 Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // 🔹 Generate JWT Token with dynamic expiry time
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });

        // 🔹 Send response (excluding password)
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                governorate: user.governorate,
                avatar: user.avatar,
                gender: user.gender,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 📌 Get the current user's profile (authentication required)
router.get('/users/me', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // From decoded token

        // Find user by ID without password
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/googleAuthRequest", googleAuthRequest);

router.get("/googleAuth", googleAuth);

router.post("/forgot-password", forgot_password);

router.post("/reset-password/:token", reset_password);

module.exports = router;
