const DailyFinance = require('../models/dailyFinance-model');
const { convertToCSV } = require('../helpers/csv-converter');

const uploadDailyFinances = async (financesData, userId) => {
    // Use insertMany with ordered: false to allow it to continue on duplicate key errors
    financesData = financesData.map((finance) => ({ ...finance, createdBy: userId }));

    const newFinances = await DailyFinance.insertMany(financesData, { ordered: false });
    return newFinances;
};

const getDailyFinanceById = async (id) => {
    return await DailyFinance.findById(id).populate('createdBy', 'name email role');
};

const getAllDailyFinances = async (filters = {}, page = 1, limit = 10) => {
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

    const finances = await DailyFinance.find(queryFilters).populate('createdBy', 'name email role');

    const total = await DailyFinance.countDocuments(queryFilters);

    return { finances, total, page, limit };
};

const exportDailyFinances = async (filters = {}) => {
    const finances = await DailyFinance.find(filters);
    return convertToCSV(finances);
};

module.exports = {
    uploadDailyFinances,
    getDailyFinanceById,
    getAllDailyFinances,
    exportDailyFinances
};
