const Product = require('../models/product-model');
const { convertToCSV } = require('../helpers/csv-converter');

const uploadProducts = async (productsData, userId) => {
    // Commenting out the code below for future edge case

    // const productNames = productsData.map((product) => product.productName);

    // // Fetch all existing products with the given product names in one query
    // const existingProducts = await Product.find({ productName: { $in: productNames } });

    // // Create a set of existing product names for quick lookup
    // const existingProductNames = new Set(existingProducts.map((product) => product.productName));

    // // Filter out products that already exist
    // let newProductsData = productsData.filter((product) => !existingProductNames.has(product.productName));

    // if (newProductsData.length === 0) {
    //     return []; // No new products to add
    // }

    // Use insertMany with ordered: false to allow it to continue on duplicate key errors
    try {
        productsData = productsData.map((product) => ({ ...product, createdBy: userId }));

        const newProducts = await Product.insertMany(productsData, { ordered: false });
        return newProducts;
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error - some products were not inserted
            return []; // Return an empty array or handle as needed
        } else {
            throw error; // Rethrow if it's another type of error
        }
    }
};

const getProductById = async (id) => {
    return await Product.findById(id).populate('createdBy', 'name email role');
};

const getAllProducts = async (filters = {}, page = 1, limit = 10) => {
    // Initialize an empty filter object
    const queryFilters = {};

    // Date range filter
    if (filters.from || filters.to) {
        queryFilters.runDate = {};
        if (filters.from) {
            queryFilters.runDate.$gte = new Date(filters.from);
        }
        if (filters.to) {
            queryFilters.runDate.$lte = new Date(filters.to);
        }
    }

    // Apply other filters
    Object.keys(filters).forEach((key) => {
        if (key !== 'from' && key !== 'to') {
            queryFilters[key] = filters[key];
        }
    });

    const products = await Product.find(queryFilters).populate('createdBy', 'name email role');

    const total = await Product.countDocuments(queryFilters);

    return { products, total, page, limit };
};

const exportProducts = async (filters = {}) => {
    const products = await Product.find(filters);
    return convertToCSV(products);
};

module.exports = {
    uploadProducts,
    getProductById,
    getAllProducts,
    exportProducts
};
