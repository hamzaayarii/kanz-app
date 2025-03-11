const Business = require('../models/Business');

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

module.exports = { addBusiness, getUserBusinesses };
