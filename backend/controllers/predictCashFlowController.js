const { spawn } = require('child_process');
const Expense = require('../models/Expense');
const DailyRevenue = require('../models/DailyRevenue');
const TaxReport = require('../models/TaxReport');
const Payroll = require("../models/Payroll");

async function forecastCashflow(cashflowHistory) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', ['../ai-services/predict_cashflow.py']);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(error));
            }
            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        // Pass the data
        python.stdin.write(JSON.stringify(cashflowHistory));
        python.stdin.end();
    });
}

// Example call
exports.runForecast = async (req, res) => {
    const raw = {};
    const { business, userId } = req.query;

    // 1. Revenus journaliers (DailyRevenue)
    const revenues = await DailyRevenue.find({ business });
    revenues.forEach(rev => {
        const date = rev.date.toISOString().split('T')[0];
        raw[date] = raw[date] || { income: 0, expense: 0, tax: 0 };
        raw[date].income += rev.amount || 0;
    });

    // 3. Dépenses générales (Expense)
    const expenses = await Expense.find({ business });
    expenses.forEach(exp => {
        const date = exp.date.toISOString().split('T')[0];
        raw[date] = raw[date] || { income: 0, expense: 0, tax: 0 };
        raw[date].expense += exp.amount || 0;
    });

    // 4. Impôts journaliers estimés (TaxReport — répartis sur l’année)
    const taxReports = await TaxReport.find({ userId });
    taxReports.forEach(tax => {
        const taxPerDay = (tax.calculatedTax || 0) / 365;
        for (let i = 0; i < 365; i++) {
            const date = new Date(tax.year, 0, 1 + i).toISOString().split('T')[0];
            raw[date] = raw[date] || { income: 0, expense: 0, tax: 0 };
            raw[date].tax += taxPerDay;
        }
    });

    // 4.5 Salaires (Payroll)
    const payrolls = await Payroll.find({ businessId: business }); // businessId not "userId"
    payrolls.forEach(pay => {
        const date = pay.period.toISOString().split('T')[0];
        raw[date] = raw[date] || { income: 0, expense: 0, tax: 0 };
        raw[date].expense += pay.netSalary || 0; // Add to expenses
    });


    // 5. Convertir au format Prophet : [{ ds, y }]
    const prophetData = Object.entries(raw).map(([date, { income, expense, tax }]) => ({
        date: date,
        inflows: income,
        outflows: expense + tax
    }));

    // Tri chronologique
    prophetData.sort((a, b) => new Date(a.date) - new Date(b.date));

    try {
        console.log(prophetData);
        const result = await forecastCashflow(prophetData);
        console.log(result);
        // Send response with the forecast data and alerts to the frontend
        res.json({
            forecast: result
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error during forecast');
    }
}
