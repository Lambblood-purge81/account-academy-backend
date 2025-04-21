// Helper function to send response
const sendResponse = (res, code = 200, data, message = 'Operation successful') => {
    res.status(code).json({ data, message });
};

module.exports = {
    sendResponse
};
