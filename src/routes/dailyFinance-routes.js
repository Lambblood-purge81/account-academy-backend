const express = require('express');
const dailyFinanceRouter = express.Router();
const { celebrate } = require('celebrate');
const DailyFinanceController = require('../controllers/dailyFinance-controller');
const DailyFinanceValidator = require('../request-schemas/dailyFinance-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkActive = require('../middleware/check-active');

const API = {
    UPLOAD_CSV: '/upload-csv',
    GET_DAILY_FINANCE: '/:id',
    GET_ALL_DAILY_FINANCES: '/',
    EXPORT_DAILY_FINANCES: '/export'
};

dailyFinanceRouter.post(API.UPLOAD_CSV, checkAuth, checkActive, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), DailyFinanceController.uploadDailyFinancesCSV);

dailyFinanceRouter.get(
    API.GET_ALL_DAILY_FINANCES,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT, CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    DailyFinanceController.getAllDailyFinances
);

dailyFinanceRouter.get(API.EXPORT_DAILY_FINANCES, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), DailyFinanceController.exportDailyFinances);

dailyFinanceRouter.get(
    API.GET_DAILY_FINANCE,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]),
    celebrate(DailyFinanceValidator.getDailyFinanceById),
    DailyFinanceController.getDailyFinanceById
);

module.exports = dailyFinanceRouter;
