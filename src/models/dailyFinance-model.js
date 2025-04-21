const mongoose = require('mongoose');

const dailyFinanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        revenue: {
            type: Number,
            required: true
        },
        orders: {
            type: Number,
            required: true
        },
        adSpend: {
            type: Number,
            required: true
        },
        roas: {
            type: Number,
            required: true
        },
        refunds: {
            type: Number,
            required: true
        },
        cog: {
            type: Number,
            required: true
        },
        profitLoss: {
            type: Number,
            required: true
        },
        margin: {
            type: Number,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

const DailyFinance = mongoose.model('DailyFinance', dailyFinanceSchema);
module.exports = DailyFinance;
