const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        business: {
            type: String,
            required: true
        },
        facture: {
            type: String,
            required: true
        },
        notes: {
            type: String,
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

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
