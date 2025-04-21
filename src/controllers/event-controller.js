const { google } = require('googleapis');
const EventService = require('../services/event-services');
const UserServices = require('../services/user-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const googleAuth = require('../utils/google-auth');
const { setGoogleCredentials } = require('../utils/google-helpers');
const { randomNumberGenerate, isEmpty } = require('../utils/utils');
const { Student, User } = require('../models/user-model');
const CONSTANT_ENUM = require('../helpers/constant-enums');

// Google Calendar Authentication
const auth = wrapAsync((req, res) => {
    const authUrl = googleAuth.getAuthUrl();
    sendResponse(res, 200, { url: authUrl }, 'Redirecting to Google Calendar Authentication...');
});

const callback = wrapAsync(async (req, res) => {
    const { code } = req.query;
    const tokens = await googleAuth.getAccessToken(code);
    tokens.userId = req.user._id; // Add user ID to tokens
    await UserServices.updateUserByID(req.user._id, { googleTokens: tokens });
    sendResponse(res, 200, { googleTokens: tokens }, 'Authentication successful');
});

// Get Google Calendar Events
const getEvents = wrapAsync(async (req, res) => {
    await setGoogleCredentials(req.user.googleTokens);
    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    });

    sendResponse(res, 200, response.data.items, 'Events fetched successfully');
});

// Create Event
const createEvent = wrapAsync(async (req, res) => {
    await setGoogleCredentials(req.user.googleTokens);

    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    const eventData = {
        ...req.body,
        createdBy: req.user._id,
        eventHost: req.user.name
    };

    const usersEmail = await Student.find({ _id: { $in: eventData.attendees } }).select('email');
    const attendees = usersEmail.map((user) => {
        return { email: user.email };
    });
    const event = {
        summary: eventData.topic,
        location: eventData.location,
        description: `${eventData.reason ? eventData.reason : ''}\nJoin here: ${eventData.meetingLink ? eventData.meetingLink : eventData.location}`,
        start: {
            dateTime: eventData.dateTime
        },
        end: {
            dateTime: new Date(new Date(eventData.dateTime).getTime() + 60 * 60 * 1000).toISOString()
        },
        attendees: attendees,
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 }
            ]
        }
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
    });

    eventData.googleCalendarEventId = response.data.id;
    const newEvent = await EventService.createEvent(eventData);

    sendResponse(res, 201, newEvent, 'Event created successfully');
});

// Update Event
const updateEvent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    const existingEvent = await EventService.getEventById(id);
    if (isEmpty(existingEvent)) throw new ErrorHandler(404, 'Event not found');

    // Only event host can delete the event
    if (user._id.toString() !== existingEvent.createdBy?._id.toString()) {
        throw new ErrorHandler(403, 'You are not authorized to update this event. Only event host can update the event');
    }

    await setGoogleCredentials(req.user.googleTokens);

    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    const usersEmail = await Student.find({ _id: { $in: updateData.attendees } }).select('email');
    const attendees = usersEmail.map((user) => {
        return { email: user.email };
    });

    const updatedEvent = {
        summary: updateData.topic || existingEvent.topic,
        location: updateData.location || existingEvent.location,
        description: `${updateData.reason ? updateData.reason : ''}\nJoin here: ${updateData.meetingLink ? updateData.meetingLink : updateData.location}`,
        start: {
            dateTime: updateData.dateTime || existingEvent.dateTime
            // timeZone: updateData.timeZone || existingEvent.timeZone
        },
        end: {
            dateTime: updateData.dateTime
                ? new Date(new Date(updateData.dateTime).getTime() + 60 * 60 * 1000).toISOString()
                : new Date(new Date(existingEvent.dateTime).getTime() + 60 * 60 * 1000).toISOString()
            // timeZone: updateData.timeZone || existingEvent.timeZone
        },
        attendees: attendees || existingEvent.attendees,
        reminders: updateData.reminders || existingEvent.reminders
    };

    const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: existingEvent.googleCalendarEventId
    });

    await calendar.events.update({
        calendarId: 'primary',
        auth: googleAuth.getOAuth2Client(),
        eventId: event.data.id,
        resource: updatedEvent
    });

    const finalUpdatedEvent = await EventService.updateEvent(id, updateData);

    sendResponse(res, 200, finalUpdatedEvent, 'Event updated successfully');
});

// Get events from Google Calendar By id
const getCalenderEventById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const existingEvent = await EventService.getEventById(id);

    if (isEmpty(existingEvent)) throw new ErrorHandler(404, 'Event not found');

    await setGoogleCredentials(req.user.googleTokens);

    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: existingEvent.googleCalendarEventId
    });

    sendResponse(res, 200, event.data, 'Event fetched successfully');
});

// Get Event by ID

const getEventById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const event = await EventService.getEventById(id);
    if (!event) throw new ErrorHandler(404, 'Event not found');
    sendResponse(res, 200, event, 'Event fetched successfully');
});

// Get all Events
const getAllEvents = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...rest } = req.query;
    // If it's coach then he can only see his events
    const user = req.user;
    if (user.role === CONSTANT_ENUM.USER_ROLE.COACH) {
        rest.createdBy = user._id;
    }

    const events = await EventService.getAllEvents(rest, page, limit);

    return res.status(200).json({
        data: events.events,
        total: events.total,
        page: events.page,
        limit: events.limit,
        message: 'Events fetched successfully'
    });
});

// Delete Event
const deleteEvent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const existingEvent = await EventService.getEventById(id);

    // Only event host can delete the event
    if (user._id.toString() !== existingEvent.createdBy?._id.toString()) {
        throw new ErrorHandler(403, 'You are not authorized to delete this event. Only event host can delete the event');
    }

    if (isEmpty(existingEvent)) throw new ErrorHandler(404, 'Event not found');

    await setGoogleCredentials(req.user.googleTokens);

    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    await calendar.events.delete({
        calendarId: 'primary',
        eventId: existingEvent.googleCalendarEventId
    });

    await EventService.deleteEvent(id);
    sendResponse(res, 200, null, 'Event deleted successfully');
});

// Student - Request a meeting
const requestMeeting = wrapAsync(async (req, res) => {
    // So call the auth and callback api first to update the google tokens
    await setGoogleCredentials(req.user.googleTokens);

    const calendar = google.calendar({ version: 'v3', auth: googleAuth.getOAuth2Client() });

    const eventData = {
        ...req.body,
        createdBy: req.user._id
    };

    const usersEmail = await User.find({ _id: { $in: eventData.attendees } }).select('email');
    const attendees = usersEmail.map((user) => {
        return { email: user.email };
    });

    const event = {
        summary: eventData.topic,
        location: eventData.location,
        description: `${eventData.reason ? eventData.reason : ''}\nJoin here: ${eventData.meetingLink ? eventData.meetingLink : eventData.location}`,
        start: {
            dateTime: eventData.dateTime,
            timeZone: eventData.timeZone
        },
        end: {
            dateTime: new Date(new Date(eventData.dateTime).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: eventData.timeZone
        },
        conferenceData: {
            createRequest: {
                requestId: randomNumberGenerate(10)
            }
        },
        attendees: attendees,
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 }
            ]
        }
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
    });

    eventData.googleCalendarEventId = response.data.id;
    const newEvent = await EventService.createEvent(eventData);

    sendResponse(res, 201, newEvent, 'Meeting request created successfully');
});
// Get Upcoming Events for Student
const getUpcomingEventsForStudent = wrapAsync(async (req, res) => {
    const studentId = req.user._id;
    const upcomingEvents = await EventService.getUpcomingEventsForStudent(studentId);

    sendResponse(res, 200, upcomingEvents, 'Upcoming events fetched successfully');
});

// Get all Events with Pagination and Search for Student
const getAllEventsForStudent = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, search = '', dateTime = '' } = req.query;
    const studentId = req.user._id;

    const events = await EventService.getAllEventsForStudent(studentId, { dateTime }, page, limit, search);

    const data = {
        data: events.events,
        total: events.total,
        page: events.page,
        limit: events.limit,
        message: 'Events fetched successfully'
    };

    sendResponse(res, 200, data, 'Events fetched successfully');
});

// Get Event by ID for Student
const getEventByIdForStudent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id;

    const event = await EventService.getEventByIdForStudent(studentId, id);
    if (!event) throw new ErrorHandler(404, 'Event not found');

    const zoomMeetingDetails = await EventService.getZoomMeetingDetails(event);

    event.zoomMeetingDetails = zoomMeetingDetails;

    sendResponse(res, 200, event, 'Event fetched successfully');
});

module.exports = {
    auth,
    callback,
    getEvents,
    createEvent,
    updateEvent,
    getEventById,
    getAllEvents,
    deleteEvent,
    requestMeeting,
    getUpcomingEventsForStudent,
    getAllEventsForStudent,
    getEventByIdForStudent,
    getCalenderEventById
};
