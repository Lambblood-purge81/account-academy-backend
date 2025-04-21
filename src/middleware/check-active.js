const { ErrorHandler } = require('../utils/error-handler');

// Middleware generator function
module.exports = (req, res, next) => {
    if (req.user.isActive) {
        next();
    } else {
        return next(new ErrorHandler(403, 'You do not have permission to access this page. Please contact the administrator for support.'));
    }
};
