const csv = require('csv-parser');
const fs = require('fs');
const { PRODUCT_FIELDS, DAILY_FINANCES_FIELDS, INVOICES_FIELDS } = require('./constant-enums');
const { ErrorHandler } = require('../utils/error-handler');
const { isNotEmpty } = require('../utils/utils');

// Function to check the format of incoming data
const requiredFields = {
    products: PRODUCT_FIELDS,
    dailyFinances: DAILY_FINANCES_FIELDS,
    invoices: INVOICES_FIELDS
};

const checkDataFormat = (data, dataType) => {
    const fields = requiredFields[dataType];
    if (!fields) return false;

    for (const field of fields) {
        if (!data[field]) return false;
    }

    return true;
};

const parseCSV = (filePath, dataType) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                if (isNotEmpty(data)) {
                    const isFormatted = checkDataFormat(data, dataType);
                    if (!isFormatted) {
                        reject(new ErrorHandler(400, 'Data is not in proper format'));
                        return;
                    }
                    results.push(data);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (error) => {
                console.log(error, 'error');
                reject(error);
            });
    });
};

module.exports = { parseCSV };
