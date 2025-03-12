const Business = require('../models/Business');
const User = require('../models/User.js');

const addBusiness = async (req, res) => {
    try {
        const { name, type, taxNumber, address, phone } = req.body;

        if (!name || !type || !taxNumber || !address) {
            return res.status(400).json({
                errorMessage: "Please provide all required fields (name, type, taxNumber, address).",
                status: false,
            });
        }

        const newBusiness = new Business({
            name,
            type,
            taxNumber,
            address,
            phone: phone || null,
            owner: req.user.id, // Assuming authentication middleware sets `req.user`
        });

        await newBusiness.save();

        res.status(201).json({
            status: true,
            message: "Business added successfully.",
            business: newBusiness,
        });

    } catch (error) {
        res.status(500).json({
            errorMessage: "Something went wrong!",
            status: false,
            error: error.message,
        });
    }
};

// New function to get businesses for the logged-in user
const getUserBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ owner: req.user.id });
        res.status(200).json({
            status: true,
            businesses
        });
    } catch (error) {
        res.status(500).json({
            errorMessage: "Something went wrong!",
            status: false,
            error: error.message,
        });
    }
};
const checkUserBusiness = async (req, res) => {
    try {
        const businesses = await Business.find({ owner: req.user.id });

        res.json({
            hasBusiness: businesses.length > 0,
            businesses // Send back the list of businesses
        });
    } catch (error) {
        console.error('Error checking user business:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};


// Updated getAccountant controller function
const getAccountant = async (req, res) => {
    try {
        // Fix: Set default role to "accountant" if not provided
        const role = req.query.role || "accountant";

        if (role !== "accountant") {
            return res.status(400).json({ message: "Invalid role requested." });
        }

        const accountants = await User.find({ role: "accountant" });
        res.json(accountants);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const assignAccountant = async (req, res) => {
    try {
        const { accountantId } = req.body;
        const businessId = req.user.businessId; // Assuming user is authenticated

        if (!accountantId) {
            return res.status(400).json({ message: "Accountant ID is required." });
        }

        // Update business with assigned accountant
        await Business.findByIdAndUpdate(businessId, { accountant: accountantId });

        res.json({ message: "Accountant assigned successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error assigning accountant", error });
    }
};
module.exports = { assignAccountant, getAccountant, addBusiness, getUserBusinesses, checkUserBusiness };
