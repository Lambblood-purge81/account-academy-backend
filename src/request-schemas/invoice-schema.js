const { Joi, Segments } = require('celebrate');

const getInvoiceById = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

module.exports = {
    getInvoiceById
};
