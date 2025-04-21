const mongoose = require('mongoose');
const { PRODUCT_STATUS } = require('../helpers/constant-enums');

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        runDate: {
            type: Date,
            required: true
        },
        ber: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: [PRODUCT_STATUS.RUNNING, PRODUCT_STATUS.READY, PRODUCT_STATUS.TO_DO],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        researchMethod: String,
        category: String,
        verkoopPrijs: String,
        link: String,
        prijs: String,
        land: String,
        video1: String,
        btw: String,
        mergeExBtw: String,
        mergeInBtw: String,
        avatarUrl: String
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
