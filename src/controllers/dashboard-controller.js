const { wrapAsync } = require('../utils/wrapAsync');
const DashboardService = require('../services/dashboard-services');
const { sendResponse } = require('../helpers/helpers');

// Get Admin Card Data
const getAdminCardData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getAdminCardData();
    sendResponse(res, 200, data, 'Admin card data fetched successfully');
});

// Get Admin Graph Data
const getAdminGraphData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getAdminGraphData(req.query);
    sendResponse(res, 200, data, 'Admin graph data fetched successfully');
});

// Get Admin Events Data
const getAdminEventsData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getAdminEventsData(req.query);
    sendResponse(res, 200, data, 'Admin events data fetched successfully');
});

// Coach

// Get Coach Card Data
const getCoachCardData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getCoachCardData(req.user._id);
    sendResponse(res, 200, data, 'Coach card data fetched successfully');
});

// Get Coach Graph Data
const getCoachGraphData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getCoachGraphData(req.user, req.query);
    sendResponse(res, 200, data, 'Coach graph data fetched successfully');
});

// Get Coach Events Data
const getCoachEventsData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getCoachEventsData(req.user, req.query);
    sendResponse(res, 200, data, 'Coach events data fetched successfully');
});

// Student

// Get Student Card Data
const getStudentCardData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getStudentCardData(req.user._id);
    sendResponse(res, 200, data, 'Student card data fetched successfully');
});
// Get Student Card Data
const getStudentCardTwoData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getStudentCardTwoData(req.user._id);
    sendResponse(res, 200, data, 'Student second card data fetched successfully');
});

// Get Student Graph Data
const getStudentGraphData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getStudentGraphData(req.user._id, req.query);
    sendResponse(res, 200, data, 'Student graph data fetched successfully');
});

// Get Student Events Data
const getStudentEventsData = wrapAsync(async (req, res) => {
    const data = await DashboardService.getStudentEventsData(req.user._id, req.query);
    sendResponse(res, 200, data, 'Student events data fetched successfully');
});

module.exports = {
    getAdminCardData,
    getAdminGraphData,
    getAdminEventsData,
    // Coach
    getCoachCardData,
    getCoachGraphData,
    getCoachEventsData,
    // Student
    getStudentCardData,
    getStudentGraphData,
    getStudentEventsData,
    getStudentCardTwoData
};
