import Treasury from "../models/Treasury.js";
import DailyRevenue from "../models/DailyRevenue.js";
import Payroll from "../models/Payroll.js";
import Expense from "../models/Expense.js";
import Business from "../models/Business.js";
import PDFDocument from 'pdfkit';


export const calculateTreasuryForDate =async (req, res) => {
    const { businessId } = req.params;
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    end.setHours(23, 59, 59, 999);
    try {
        const previous = await Treasury.findOne({
            business: businessId,
            'dateRange.end': {$lt: start}
        }).sort({'dateRange.end': -1});

        const openingBalance = previous ? previous.closingBalance : 0;

        const daily = await DailyRevenue.findOne({business: businessId, date: {$gte: start, $lte: end}});

        const revenueFromDaily = daily ? daily.summary.totalRevenue : 0;
        const expensesFromDaily = daily ? daily.summary.totalExpenses : 0;

        const otherExpenses = await Expense.aggregate([
            {$match: {business: businessId, date: {$gte: start, $lte: end}}},
            {$group: {_id: null, total: {$sum: '$amount'}}}
        ]);

        const expensesFromExpenses = otherExpenses[0]?.total || 0;

        const payrolls = await Payroll.aggregate([
            {$match: {businessId: businessId, period: {$gte: start, $lte: end}}},
            {$group: {_id: null, total: {$sum: '$netSalary'}}}
        ]);

        const payrollOutflows = payrolls[0]?.total || 0;

        const totalInflows = revenueFromDaily;
        const totalOutflows = expensesFromDaily + expensesFromExpenses + payrollOutflows;
        const closingBalance = openingBalance + totalInflows - totalOutflows;

        await Treasury.findOneAndUpdate(
            {business: businessId, dateRange: {start, end}},
            {
                business: businessId,
                dateRange: {start, end},
                openingBalance,
                totalInflows,
                totalOutflows,
                closingBalance,
                details: {
                    revenueFromDaily,
                    expensesFromDaily,
                    expensesFromExpenses,
                    payrollOutflows
                }
            },
            {upsert: true, new: true}
        );
        res.status(200).json({ message: 'Treasury report created successfully' });
    }catch (err){
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getTreasuriesByBusiness = async (req, res) => {
    const { businessId } = req.query;
    try {
        const treasuries = await Treasury.find({business : businessId});
        res.json(treasuries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

export const deleteTreasuryById = async (req, res) => {
    try {
        const treasury = await Treasury.findByIdAndDelete(req.params.id);
        if (!treasury) return res.status(404).json({ message: 'Treasury not found' });
        res.json({ message: 'Treasury deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const downloadTreasury = async (req, res) => {
    const report = await Treasury.findById(req.params.id);
    const business = await Business.findById(report.business);

    if (!report || !business) {
        return res.status(404).send('Report or business not found.');
    }

    generateTreasuryReportPDF(report, business, res);
}



function formatCurrency(val) {
    return `${val?.toFixed(3) || '0.000'} DT`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function generateTreasuryReportPDF(report, business, res) {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=treasury-report.pdf');
    doc.pipe(res);

    // HEADER
    doc.font('Helvetica-Bold').fontSize(16).text('Treasury Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12)
        .text(`Company: ${business.name}`, { align: 'center' })
        .text(`Tax ID: ${business.taxNumber || 'N/A'}`, { align: 'center' })
        .text(`Period: ${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`, { align: 'center' });
    doc.moveDown(2);

    // SECTION: BALANCES
    doc.font('Helvetica-Bold').fontSize(14).text('Balance Summary', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12)
        .text(`Opening Balance: ${formatCurrency(report.openingBalance)}`)
        .text(`Total Inflows (Revenue): ${formatCurrency(report.totalInflows)}`)
        .text(`Total Outflows (Expenses + Payroll): ${formatCurrency(report.totalOutflows)}`)
        .font('Helvetica-Bold')
        .text(`Closing Balance: ${formatCurrency(report.closingBalance)}`);
    doc.moveDown(2);

    // SECTION: DETAILS
    doc.font('Helvetica-Bold').fontSize(14).text('Report Details', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12)
        .text(`Revenue from Daily Sales: ${formatCurrency(report.details?.revenueFromDaily)}`)
        .text(`Variable Costs (from Daily Revenue): ${formatCurrency(report.details?.expensesFromDaily)}`)
        .text(`Fixed Charges (from Expense Records): ${formatCurrency(report.details?.expensesFromExpenses)}`)
        .text(`Payroll Payments: ${formatCurrency(report.details?.payrollOutflows)}`);
    doc.moveDown(2);

    // FOOTER
    doc.font('Helvetica').fontSize(10)
        .text('Compliant with Tunisian Accounting Standards (NCT)', { align: 'center' })
        .text(`Generated on: ${formatDate(new Date())}`, { align: 'center' });

    doc.end();
}

