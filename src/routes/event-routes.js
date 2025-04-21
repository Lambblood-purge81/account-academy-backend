const express = require('express');
const eventRouter = express.Router();
const { celebrate } = require('celebrate');
const audit = require('../middleware/audit');
const EventController = require('../controllers/event-controller');
const EventValidator = require('../request-schemas/event-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkObjectId = require('../helpers/check-object-id');
const checkActive = require('../middleware/check-active');

const API = {
    AUTH: '/auth',
    CALLBACK: '/callback',
    CREATE_EVENT: '/create',
    REQUEST_MEETING: '/meeting-request',
    UPDATE_EVENT: '/update/:id',
    GET_EVENT: '/:id',
    GET_ALL_EVENTS: '/',
    GET_CALENDAR_EVENTS: '/calendar-events',
    GET_CALENDAR_EVENT_BY_ID: '/calendar/:id',
    DELETE_EVENT: '/delete/:id',
    GET_UPCOMING_EVENTS: '/upcoming-events',
    GET_ALL_EVENTS_FOR_STUDENT: '/student/events',
    GET_EVENT_BY_ID_FOR_STUDENT: '/student/events/:id'
};

// Google Calendar Authentication
eventRouter.get(API.AUTH, audit, checkAuth, EventController.auth);
eventRouter.get(API.CALLBACK, audit, checkAuth, EventController.callback);

eventRouter.post(
    API.CREATE_EVENT,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(EventValidator.createEvent),
    EventController.createEvent
);
// Student
eventRouter.post(API.REQUEST_MEETING, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), checkActive, celebrate(EventValidator.requestMeeting), EventController.requestMeeting);

eventRouter.get(API.GET_UPCOMING_EVENTS, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), EventController.getUpcomingEventsForStudent);

eventRouter.get(API.GET_ALL_EVENTS_FOR_STUDENT, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), EventController.getAllEventsForStudent);
// Google Calendar Events
eventRouter.get(API.GET_CALENDAR_EVENTS, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), EventController.getEvents);
eventRouter.get(API.GET_CALENDAR_EVENT_BY_ID, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), EventController.getCalenderEventById);

eventRouter.get(API.GET_EVENT_BY_ID_FOR_STUDENT, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), celebrate(EventValidator.getEventById), EventController.getEventByIdForStudent);

eventRouter.put(
    API.UPDATE_EVENT,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(EventValidator.updateEvent),
    EventController.updateEvent
);

eventRouter.get(
    API.GET_EVENT,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(EventValidator.getEventById),
    EventController.getEventById
);

eventRouter.get(API.GET_ALL_EVENTS, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), EventController.getAllEvents);

eventRouter.delete(
    API.DELETE_EVENT,
    audit,
    checkObjectId,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(EventValidator.deleteEvent),
    EventController.deleteEvent
);

module.exports = eventRouter;
