// src/controllers/userController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from "google-auth-library";
import generator from "generate-password";
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// List all users
export const list = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclure les mots de passe
        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error("Error listing users:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Créer un nouvel utilisateur
export const create = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, governorate, avatar, gender } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Full name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            governorate,
            avatar,
            gender
        });

        const savedUser = await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: {
                _id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                phoneNumber: savedUser.phoneNumber,
                governorate: savedUser.governorate,
                avatar: savedUser.avatar,
                gender: savedUser.gender,
                createdAt: savedUser.createdAt
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ success: false, message: "Error creating user", error: error.message });
    }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        if (updateData.password) {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Mettre à jour le statut de ban d'un utilisateur
export const toggleBan = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fonction de login
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Attempting to find user with email:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        console.log('User found:', user);

        // Vérifier si l'utilisateur est banni
        if (user.isBanned) {
            console.log('User is banned');
            return res.status(403).json({ success: false, message: "Your account is banned. Please contact support." });
        }

        console.log('Checking password match');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        console.log('Password matches');

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, isBanned: user.isBanned },
            process.env.SECRET_KEY,  // Secret key loaded from environment variables
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }  // Default expiration time
        );

        console.log('Token generated:', token);

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
                createdAt: user.createdAt,
                role: user.role,
                isBanned: user.isBanned
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Authentification via Google
export const googleAuthRequest = async (req, res) => {
    res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header("Referrer-Policy", "no-referrer-when-downgrade");

    const redirectURL = 'http://127.0.0.1:5000/api/users/googleAuth';
    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectURL
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        prompt: 'consent'
    });

    res.json({ url: authorizeUrl });
};

export const googleAuth = async (req, res) => {
    const code = req.query.code;
    try {
        const redirectURL = "http://127.0.0.1:5000/api/users/googleAuth";
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
        );
        const r = await oAuth2Client.getToken(code);
        await oAuth2Client.setCredentials(r.tokens);

        const userData = await getUserData(oAuth2Client.credentials.access_token);
        let { name, email, password } = userData;

        let user = await User.findOne({ email });
        if (!user) {
            password = generator.generate({ length: 12, numbers: true, symbols: true, uppercase: true, lowercase: true, strict: true });
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

            user = new User({ email, password: hashedPassword, fullName: name, verificationToken, verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 });
            await user.save();
            user = await User.findOne({ email });
        }

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: { ...user._doc, password: undefined }
        });
    } catch (err) {
        console.error('Error logging in with OAuth2 user', err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Gestion du mot de passe oublié
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        user.resetToken = resetToken;
        await user.save();

        const resetLink = `http://localhost:5000/api/users/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Email could not be sent", error: err.message });
            }
            res.status(200).json({ message: "Password reset link sent to email" });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Réinitialisation du mot de passe
export const reset_password = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId, resetToken: token });
        if (!user) return res.status(404).json({ message: "Invalid or expired token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Fonction pour récupérer les données de l'utilisateur via Google
const getUserData = async (accessToken) => {
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data from Google:', error);
        throw error;
    }
};