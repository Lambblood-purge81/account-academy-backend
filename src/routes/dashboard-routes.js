// routes/admin-dashboard-routes.js
const express = require('express');
const dashboardRouter = express.Router();
const DashboardController = require('../controllers/dashboard-controller');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const { USER_ROLE } = require('../helpers/constant-enums');

const API = {
    GET_ADMIN_CARD_DATA: '/admin/cards',
    GET_ADMIN_GRAPH_DATA: '/admin/graphs',
    GET_ADMIN_EVENTS_DATA: '/admin/events',
    // Coach
    GET_COACH_CARD_DATA: '/coach/cards',
    GET_COACH_GRAPH_DATA: '/coach/graphs',
    GET_COACH_EVENTS_DATA: '/coach/events',
    // Student
    GET_STUDENT_CARD_DATA: '/student/cards',
    GET_STUDENT_SECOND_CARD_DATA: '/student/cards-second',
    GET_STUDENT_GRAPH_DATA: '/student/graphs',
    GET_STUDENT_EVENTS_DATA: '/student/events'
};

dashboardRouter.get(API.GET_ADMIN_CARD_DATA, checkAuth, authorizedRoles([USER_ROLE.ADMIN]), DashboardController.getAdminCardData);
dashboardRouter.get(API.GET_ADMIN_GRAPH_DATA, checkAuth, authorizedRoles([USER_ROLE.ADMIN]), DashboardController.getAdminGraphData);
dashboardRouter.get(API.GET_ADMIN_EVENTS_DATA, checkAuth, authorizedRoles([USER_ROLE.ADMIN]), DashboardController.getAdminEventsData);
// Coach
dashboardRouter.get(API.GET_COACH_CARD_DATA, checkAuth, authorizedRoles([USER_ROLE.COACH]), DashboardController.getCoachCardData);
dashboardRouter.get(API.GET_COACH_GRAPH_DATA, checkAuth, authorizedRoles([USER_ROLE.COACH]), DashboardController.getCoachGraphData);
dashboardRouter.get(API.GET_COACH_EVENTS_DATA, checkAuth, authorizedRoles([USER_ROLE.COACH]), DashboardController.getCoachEventsData);

// Student
dashboardRouter.get(API.GET_STUDENT_CARD_DATA, checkAuth, authorizedRoles([USER_ROLE.STUDENT]), DashboardController.getStudentCardData);

dashboardRouter.get(API.GET_STUDENT_SECOND_CARD_DATA, checkAuth, authorizedRoles([USER_ROLE.STUDENT]), DashboardController.getStudentCardTwoData);
dashboardRouter.get(API.GET_STUDENT_GRAPH_DATA, checkAuth, authorizedRoles([USER_ROLE.STUDENT]), DashboardController.getStudentGraphData);
dashboardRouter.get(API.GET_STUDENT_EVENTS_DATA, checkAuth, authorizedRoles([USER_ROLE.STUDENT]), DashboardController.getStudentEventsData);

module.exports = dashboardRouter;
