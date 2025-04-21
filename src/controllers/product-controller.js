const ProductService = require('../services/product-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const { parseCSV } = require('../helpers/csv-parser');
const CONSTANT_ENUM = require('../helpers/constant-enums');

// Upload CSV
const uploadProductsCSV = wrapAsync(async (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        throw new ErrorHandler(400, 'No file path provided');
    }

    const productsData = await parseCSV(filePath, CONSTANT_ENUM.DATA_FORMAT.PRODUCTS);
    // if parsed data is not in proper format of products then shows an error
    const newProducts = await ProductService.uploadProducts(productsData, req.user._id);
    sendResponse(res, 201, newProducts, 'Products uploaded successfully');
});

// Get Single Product
const getProductById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    if (!product) throw new ErrorHandler(404, 'Product not found');
    sendResponse(res, 200, product, 'Product fetched successfully');
});

// Get All Products with Filters
const getAllProducts = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const user = req.user;
    // Students can only see their own products
    if (user.role === CONSTANT_ENUM.USER_ROLE.STUDENT) {
        filters.createdBy = user._id;
    }

    const products = await ProductService.getAllProducts(filters, page, limit);
    return res.status(200).json({
        data: products.products,
        total: products.total,
        page: products.page,
        limit: products.limit,
        message: 'Products fetched successfully'
    });
});

// Export Products
const exportProducts = wrapAsync(async (req, res) => {
    const { filters } = req.query;
    const csvData = await ProductService.exportProducts(filters);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csvData);
});

module.exports = {
    uploadProductsCSV,
    getProductById,
    getAllProducts,
    exportProducts
};
