const express = require('express');
const cors = require('cors');
const app = express();
require('./src/config/mongoose').connect();
const errorHandler = require('./src/utils/error-handler');
const { isJsonStr } = require('./src/utils/utils');
const { createUserApiLog } = require('./src/models/log-model');
const requestIp = require('request-ip');
const { expressLogger, expressErrorLogger, logger } = require('./src/utils/winston-logger');
const endMw = require('express-end');
const { isCelebrateError, errors } = require('celebrate');
const fs = require('fs');
// Routes
const userRoutes = require('./src/routes/user-routes');
const config = require('./src/config/config');
const mediaRouter = require('./src/routes/media-routes');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('express-compression');
const rateLimit = require('express-rate-limit');
const coachesRouter = require('./src/routes/coach-routes');
const studentsRouter = require('./src/routes/student-routes');
const eventsRouter = require('./src/routes/event-routes');
const coursesRouter = require('./src/routes/course-routes');
const lecturesRouter = require('./src/routes/lecture-routes');
const dashboardsRouter = require('./src/routes/dashboard-routes');
const productsRouter = require('./src/routes/product-routes');
const dailyFinancesRouter = require('./src/routes/dailyFinance-routes');
const invoicesRouter = require('./src/routes/invoice-routes');

// This will create folder in root dir with provided name and if exist already nothing happen
const uploadsFolder = './uploads';
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder);
}

// ----------------------------------Middleware Ended-------------------------------

// Order of this route matters need to place this above store log middleware as it's returning empty result and we don't need to store record of this
app.get('/' + config.server.route + '/pingServer', (req, res) => {
    // Route to Ping & check if Server is online
    res.status(200).send('OK');
});

// Apply the rate limiting middleware to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// ----------------------------Middleware for accepting encoded & json request params
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ----------------------------------Middleware Ended-------------------------------

// ----------------------------Middleware for capturing request is actually ended even though listener is timed out
app.use(endMw);
// ----------------------------------Middleware Ended-------------------------------

// // ----------------------------Middleware for reading raw Body as text use req.body
app.use(
    express.text({
        type: 'text/plain',
        limit: '50mb'
    })
);
// ----------------------------------Middleware Ended-------------------------------

// ----------------------------Middleware for Getting a user's IP
app.use(requestIp.mw());
// ----------------------------------Middleware Ended-------------------------------

// ----------------------------Middleware for printing logs on console
app.use(expressLogger);
// ----------------------------------Middleware Ended-------------------------------------

// ----------------------------Middleware to Fix CORS Errors This Will Update The Incoming Request before sending to routes
// Allow requests from all origins
app.use(cors());

// Configure Helmet
app.use(helmet());

// Add Helmet configurations
app.use(
    helmet.crossOriginResourcePolicy({
        policy: 'cross-origin'
    })
);

app.use(
    helmet.referrerPolicy({
        policy: 'no-referrer'
    })
);

// sanitize request data
// Configure xssClean middleware to whitelist all tags except <script> and allow "style" attribute
const xssOptions = {
    whiteList: {
        '*': ['style'], // Allow all tags with "style" attribute
        script: [] // Disallow <script> tags
    }
};

app.use(xss(xssOptions));

app.use(mongoSanitize());

// gzip compression
app.use(compression());

// --------------------------------------------------------Middleware Ended----------------------------------------------

// -----------------------------Middleware for storing API logs into DB
app.use(function (req, res, next) {
    // Do whatever you want this will execute when response is finished
    res.once('end', function () {
        createUserApiLog(req, res);
    });

    // Save Response body
    const oldSend = res.send;
    res.send = function (data) {
        res.locals.resBody = isJsonStr(data) ? JSON.parse(data) : data;
        oldSend.apply(res, arguments);
    };
    next();
});
// --------------------------------------------------------Middleware Ended----------------------------------------------

app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('src/assets/image'));

// Routes which should handle requests
app.use('/' + config.server.route + '/user', userRoutes);
app.use('/' + config.server.route + '/media', mediaRouter);
app.use('/' + config.server.route + '/coach', coachesRouter);
app.use('/' + config.server.route + '/student', studentsRouter);
app.use('/' + config.server.route + '/event', eventsRouter);
app.use('/' + config.server.route + '/course', coursesRouter);
app.use('/' + config.server.route + '/lecture', lecturesRouter);
app.use('/' + config.server.route + '/dashboard', dashboardsRouter);
app.use('/' + config.server.route + '/product', productsRouter);
app.use('/' + config.server.route + '/dailyFinance', dailyFinancesRouter);
app.use('/' + config.server.route + '/invoice', invoicesRouter);

// ----------------------------Middleware for catching 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error(errorHandler.ERROR_404);
    error.statusCode = 404;
    next(error);
});

process.on('unhandledRejection', (error) => {
    logger.log({
        level: 'error',
        message: `Unhandled Rejection:, ${JSON.stringify({ error: error.message, stack: error.stack })}`
    });
    // Additional logic (like sending email notifications)
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.log({
        level: 'error',
        message: `Unhandled Exception:, ${JSON.stringify({ error: error.message, stack: error.stack })}`
    }); // Additional logic (like shutting down the server gracefully)
    process.exit(1);
});

app.use(errors());

// Error handler
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    const sendErrorResponse = (status, message, desc, stack) => {
        res.status(status).json({
            result: message,
            code: status,
            desc,
            stack: process.env.NODE_ENV === 'production' ? null : stack
        });
    };
    // Celebrate validation errors
    if (isCelebrateError(error)) {
        const errorBody = error.details.get('body') || error.details.get('params') || error.details.get('headers');
        const {
            details: [errorDetails]
        } = errorBody;

        sendErrorResponse(422, 'Validation error', errorDetails.message, error.stack);
    }
    // MongoDB errors
    else if (error.name === 'MongoError') {
        if (error.code === 11000) {
            sendErrorResponse(409, 'Conflict', 'Duplicate key', error.stack);
        } else {
            sendErrorResponse(500, 'error', error.message || 'Internal Server Error', error.stack);
        }
    } else if (error.name === 'MongoServerError') {
        if (error.code === 11000) {
            sendErrorResponse(409, 'Conflict', 'User already exists', error.stack);
        } else {
            sendErrorResponse(500, 'error', error.message || 'Internal Server Error', error.stack);
        }
    }
    // ObjectID errors
    else if (error.name === 'CastError' && error.kind === '[ObjectId]') {
        sendErrorResponse(400, 'Bad Request', 'Invalid ID', error.stack);
    } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
        sendErrorResponse(400, 'Bad Request', 'Invalid ID', error.stack);
    }
    // Validation errors
    else if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        sendErrorResponse(422, 'error', 'Validation failed', error.stack, messages);
    }
    // Other errors
    else {
        const statusCode = error.statusCode || 500;
        sendErrorResponse(statusCode, 'error', error.message || 'Internal Server Error', error.stack);
    }
});

// Best Tested place that store only uncaught errors
app.use(expressErrorLogger);

module.exports = app;
