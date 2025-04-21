const express = require('express');
const productRouter = express.Router();
const { celebrate } = require('celebrate');
const ProductController = require('../controllers/product-controller');
const ProductValidator = require('../request-schemas/product-schema');
const checkAuth = require('../middleware/check-auth');
const checkActive = require('../middleware/check-active');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');

const API = {
    UPLOAD_CSV: '/upload-csv',
    GET_PRODUCT: '/:id',
    GET_ALL_PRODUCTS: '/',
    EXPORT_PRODUCTS: '/export'
};

productRouter.post(API.UPLOAD_CSV, checkAuth, checkActive, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), ProductController.uploadProductsCSV);

productRouter.get(API.GET_ALL_PRODUCTS, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT, CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), ProductController.getAllProducts);

productRouter.get(API.EXPORT_PRODUCTS, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), ProductController.exportProducts);

productRouter.get(
    API.GET_PRODUCT,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT, CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(ProductValidator.getProductById),
    ProductController.getProductById
);

module.exports = productRouter;
