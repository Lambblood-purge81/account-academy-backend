const Invoice = require('../models/invoice-model');
const { convertToCSV } = require('../helpers/csv-converter');

const uploadInvoices = async (invoicesData, userId) => {
    try {
        invoicesData = invoicesData.map((invoice) => ({ ...invoice, createdBy: userId }));

        const newInvoices = await Invoice.insertMany(invoicesData, { ordered: false });
        return newInvoices;
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error - some invoices were not inserted
            return []; // Return an empty array or handle as needed
        } else {
            throw error; // Rethrow if it's another type of error
        }
    }
};

const getInvoiceById = async (id) => {
    return await Invoice.findById(id).populate('createdBy', 'name email role');
};

const getAllInvoices = async (filters = {}, page = 1, limit = 10) => {
    // Initialize an empty filter object
    const queryFilters = {};

    // Date range filter
    if (filters.from || filters.to) {
        queryFilters.date = {};
        if (filters.from) {
            queryFilters.date.$gte = new Date(filters.from);
        }
        if (filters.to) {
            queryFilters.date.$lte = new Date(filters.to);
        }
    }

    // Apply other filters
    Object.keys(filters).forEach((key) => {
        if (key !== 'from' && key !== 'to') {
            queryFilters[key] = filters[key];
        }
    });

    const invoices = await Invoice.find(queryFilters).populate('createdBy', 'name email role');

    const total = await Invoice.countDocuments(queryFilters);

    return { invoices, total, page, limit };
};

const exportInvoices = async (filters = {}) => {
    const invoices = await Invoice.find(filters);
    return convertToCSV(invoices);
};

module.exports = {
    uploadInvoices,
    getInvoiceById,
    getAllInvoices,
    exportInvoices
};
