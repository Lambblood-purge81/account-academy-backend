const express = require('express');
const invoiceRouter = express.Router();
const { celebrate } = require('celebrate');
const InvoiceController = require('../controllers/invoice-controller');
const InvoiceValidator = require('../request-schemas/invoice-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkActive = require('../middleware/check-active');

const API = {
    UPLOAD_CSV: '/upload-csv',
    GET_INVOICE: '/:id',
    GET_ALL_INVOICES: '/',
    EXPORT_INVOICES: '/export'
};

invoiceRouter.post(API.UPLOAD_CSV, checkAuth, checkActive, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), InvoiceController.uploadInvoicesCSV);

invoiceRouter.get(API.GET_ALL_INVOICES, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT, CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), InvoiceController.getAllInvoices);

invoiceRouter.get(API.EXPORT_INVOICES, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), InvoiceController.exportInvoices);

invoiceRouter.get(API.GET_INVOICE, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), celebrate(InvoiceValidator.getInvoiceById), InvoiceController.getInvoiceById);

module.exports = invoiceRouter;
