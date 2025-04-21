const DailyFinanceService = require('../services/dailyFinance-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const { parseCSV } = require('../helpers/csv-parser');
const CONSTANT_ENUM = require('../helpers/constant-enums');

// Upload CSV
const uploadDailyFinancesCSV = wrapAsync(async (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        throw new ErrorHandler(400, 'No file path provided');
    }

    const financesData = await parseCSV(filePath, CONSTANT_ENUM.DATA_FORMAT.DAILY_FINANCES);
    const newFinances = await DailyFinanceService.uploadDailyFinances(financesData, req.user._id);
    sendResponse(res, 201, newFinances, 'Daily Finances uploaded successfully');
});

// Get Single Daily Finance
const getDailyFinanceById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const finance = await DailyFinanceService.getDailyFinanceById(id);
    if (!finance) throw new ErrorHandler(404, 'Daily Finance not found');
    sendResponse(res, 200, finance, 'Daily Finance fetched successfully');
});

// Get All Daily Finances with Filters
const getAllDailyFinances = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const user = req.user;
    // Students can only see their own products
    if (user.role === CONSTANT_ENUM.USER_ROLE.STUDENT) {
        filters.createdBy = user._id;
    }

    const finances = await DailyFinanceService.getAllDailyFinances(filters, page, limit);
    return res.status(200).json({
        data: finances.finances,
        total: finances.total,
        page: finances.page,
        limit: finances.limit,
        message: 'Daily Finances fetched successfully'
    });
});

// Export Daily Finances
const exportDailyFinances = wrapAsync(async (req, res) => {
    const { filters } = req.query;
    const csvData = await DailyFinanceService.exportDailyFinances(filters);
    res.header('Content-Type', 'text/csv');
    res.attachment('dailyFinances.csv');
    return res.send(csvData);
});

module.exports = {
    uploadDailyFinancesCSV,
    getDailyFinanceById,
    getAllDailyFinances,
    exportDailyFinances
};
