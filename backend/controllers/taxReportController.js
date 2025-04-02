const TaxReport = require('../models/TaxReport');

const generateTaxReport = async (req, res) => {
    const { income, expenses, year, taxRate } = req.body;

    if (!income || !expenses || !year || !taxRate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Calcul du revenu imposable et de la taxe
        const taxableIncome = income - expenses;
        const calculatedTax = taxableIncome * taxRate;

        // Création du rapport fiscal
        const taxReport = new TaxReport({
            userId: req.user.id,
            year,
            income,
            expenses,
            taxRate,
            calculatedTax,
        });

        await taxReport.save();
        res.status(201).json({ message: 'Tax report generated successfully', taxReport });
    } catch (err) {
        console.error('Error generating tax report:', err);
        res.status(500).json({ message: 'Error generating tax report' });
    }
};

const getTaxReports = async (req, res) => {
    try {
        const reports = await TaxReport.find({ userId: req.user.id });
        res.json({ reports });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error fetching tax reports' });
    }
};

module.exports = { generateTaxReport, getTaxReports };
