const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    period: { type: Date, required: true },
    grossSalary: { type: Number, required: true },
    cnssContribution: { type: Number, required: true },
    irpp: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;