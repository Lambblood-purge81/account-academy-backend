const InvoiceService = require('../services/invoice-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const { parseCSV } = require('../helpers/csv-parser');
const CONSTANT_ENUM = require('../helpers/constant-enums');

// Upload CSV
const uploadInvoicesCSV = wrapAsync(async (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        throw new ErrorHandler(400, 'No file path provided');
    }

    const invoicesData = await parseCSV(filePath, CONSTANT_ENUM.DATA_FORMAT.INVOICES);
    const newInvoices = await InvoiceService.uploadInvoices(invoicesData, req.user._id);
    sendResponse(res, 201, newInvoices, 'Invoices uploaded successfully');
});

// Get Single Invoice
const getInvoiceById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const invoice = await InvoiceService.getInvoiceById(id);
    if (!invoice) throw new ErrorHandler(404, 'Invoice not found');
    sendResponse(res, 200, invoice, 'Invoice fetched successfully');
});

// Get All Invoices with Filters
const getAllInvoices = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const user = req.user;
    // Students can only see their own products
    if (user.role === CONSTANT_ENUM.USER_ROLE.STUDENT) {
        filters.createdBy = user._id;
    }

    const invoices = await InvoiceService.getAllInvoices(filters, page, limit);
    return res.status(200).json({
        data: invoices.invoices,
        total: invoices.total,
        page: invoices.page,
        limit: invoices.limit,
        message: 'Invoices fetched successfully'
    });
});

// Export Invoices
const exportInvoices = wrapAsync(async (req, res) => {
    const { filters } = req.query;
    const csvData = await InvoiceService.exportInvoices(filters);
    res.header('Content-Type', 'text/csv');
    res.attachment('invoices.csv');
    return res.send(csvData);
});

module.exports = {
    uploadInvoicesCSV,
    getInvoiceById,
    getAllInvoices,
    exportInvoices
};
