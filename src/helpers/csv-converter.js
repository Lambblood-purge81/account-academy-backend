const { Parser } = require('json2csv');

const convertToCSV = (data) => {
    const json2csvParser = new Parser();
    return json2csvParser.parse(data);
};

module.exports = { convertToCSV };
