const Business = require('../models/Business');
const User = require('../models/User.js');

const addBusiness = async (req, res) => {
    try {
        const { name, type, taxNumber, address, phone } = req.body;
        const userId = req.user._id || req.user.id; // Handle both _id and id

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
            owner: userId,
        });

        await newBusiness.save();

        res.status(201).json({
            status: true,
            message: "Business added successfully.",
            business: newBusiness,
        });

    } catch (error) {
        console.error('Error adding business:', error);
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
        const userId = req.user._id || req.user.id;
        const businesses = await Business.find({ owner: userId });
        res.status(200).json({
            status: true,
            businesses
        });
    } catch (error) {
        console.error('Error getting user businesses:', error);
        res.status(500).json({
            errorMessage: "Something went wrong!",
            status: false,
            error: error.message,
        });
    }
};

const checkUserBusiness = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const businesses = await Business.find({ owner: userId });

        res.json({
            hasBusiness: businesses.length > 0,
            businesses
        });
    } catch (error) {
        console.error('Error checking user business:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Updated getAccountant controller function
const getAccountant = async (req, res) => {
    try {
        const role = req.query.role || "accountant";

        if (role !== "accountant") {
            return res.status(400).json({ message: "Invalid role requested." });
        }

        const accountants = await User.find({ role: "accountant" });
        res.json(accountants);
    } catch (error) {
        console.error('Error getting accountants:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const assignAccountant = async (req, res) => {
    try {
        const { accountantId } = req.body;
        const userId = req.user._id || req.user.id;

        if (!accountantId) {
            return res.status(400).json({ message: "Accountant ID is required." });
        }

        // Update business with assigned accountant
        const business = await Business.findOne({ owner: userId });
        if (!business) {
            return res.status(404).json({ message: "Business not found." });
        }

        business.accountant = accountantId;
        await business.save();

        res.json({ message: "Accountant assigned successfully.", business });
    } catch (error) {
        console.error('Error assigning accountant:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;

        const deletedBusiness = await Business.findByIdAndDelete(businessId);
        if (!deletedBusiness) {
            return res.status(404).json({ message: "Business not found." });
        }

        res.json({ message: "Business deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting business", error });
    }
};

const updateBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;
        const updates = req.body;

        const updatedBusiness = await Business.findByIdAndUpdate(businessId, updates, { new: true });
        if (!updatedBusiness) {
            return res.status(404).json({ message: "Business not found." });
        }

        res.json({ message: "Business updated successfully.", business: updatedBusiness });
    } catch (error) {
        res.status(500).json({ message: "Error updating business", error });
    }
};

module.exports = { deleteBusiness, updateBusiness, assignAccountant, getAccountant, addBusiness, getUserBusinesses, checkUserBusiness };
