const CONSTANT_ENUM = require('../helpers/constant-enums');
const Event = require('../models/event-model');
const { getZoomAccessToken, getNearestOccurrenceId } = require('../utils/zoom-meeting');
const axios = require('axios');

const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

const updateEvent = async (id, updateData) => {
    return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

const getEventById = async (id) => {
    return await Event.findById(id).populate('createdBy', 'name email role avatar').populate('attendees', 'name email role');
};

const getAllEvents = async (filters = {}, page = 1, limit = 10) => {
    switch (filters.dateTime || '') {
        case CONSTANT_ENUM.DATE_FILTERS.PAST:
            filters.dateTime = { $lt: new Date() };
            break;
        case CONSTANT_ENUM.DATE_FILTERS.PRESENT:
            // remove the dateTime filter
            delete filters.dateTime;
            break;
        case CONSTANT_ENUM.DATE_FILTERS.FUTURE:
            filters.dateTime = { $gt: new Date() };
            break;
        default:
            filters.dateTime = { $gte: new Date() };
            break;
    }

    const events = await Event.find(filters).populate('createdBy', 'name email').populate('attendees', 'name email role').sort({ createdAt: -1 });

    const total = await Event.countDocuments(filters);

    return { events, total, page, limit };
};

const deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id);
};

const getUpcomingEventsForStudent = async (studentId) => {
    const currentDate = new Date();
    return await Event.find({
        attendees: studentId,
        dateTime: { $gte: currentDate }
    })
        .sort({ dateTime: -1 })
        .limit(1);
};

const getAllEventsForStudent = async (studentId, filters = {}, page = 1, limit = 10, search = '') => {
    const query = {
        attendees: { $in: [studentId] }
    };

    switch (filters.dateTime || '') {
        case CONSTANT_ENUM.DATE_FILTERS.PAST:
            query.dateTime = { $lt: new Date() };
            break;
        case CONSTANT_ENUM.DATE_FILTERS.PRESENT:
            // remove the dateTime filter
            delete query.dateTime;
            break;
        case CONSTANT_ENUM.DATE_FILTERS.FUTURE:
            query.dateTime = { $gt: new Date() };
            break;
        default:
            query.dateTime = { $gte: new Date() };
            break;
    }

    if (search) {
        query.topic = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query).skip(skip).limit(limit).populate('createdBy', 'name email role avatar').populate('attendees', 'name email role').exec();
    const total = await Event.countDocuments(query).exec();

    return { events, total, page, limit };
};

const getEventByIdForStudent = async (studentId, eventId) => {
    return await Event.findOne({ _id: eventId, attendees: studentId }).populate('createdBy', 'name email role avatar clientId accountId clientSecret').populate('attendees', 'name email role').exec();
};

const getZoomMeetingDetails = async (event) => {
    try {
        const checkCredentials = event?.createdBy?.clientId && event?.createdBy?.clientSecret && event?.createdBy?.accountId;
        if (!checkCredentials) {
            return {};
        }

        const accessToken = await getZoomAccessToken(event.createdBy);

        const { data } = await axios.get(`https://api.zoom.us/v2/meetings/${event?.meetingLink.split('https://us02web.zoom.us/j/')[1]}?show_previous_occurrences=true`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const nearestOccurrenceId = getNearestOccurrenceId(event?.dateTime, data?.occurrences);

        const { data: meetingDetails } = await axios.get(
            `https://api.zoom.us/v2/meetings/${event?.meetingLink.split('https://us02web.zoom.us/j/')[1]}?occurrence_id${nearestOccurrenceId}&&show_previous_occurrences=true`,

            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        // /past_meetings/:meetingId/participants?page_size=30

        const { data: attendees } = await axios.get(`https://api.zoom.us/v2/past_meetings/${nearestOccurrenceId}/participants?page_size=50`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const { data: recordings } = await axios.get(`https://api.zoom.us/v2/past_meetings/${nearestOccurrenceId}/recordings`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return { meetingDetails, attendees: attendees?.participants ?? attendees?.participants, recordings: recordings?.recordings_files ? recordings?.recordings_files : [] };
    } catch (error) {
        return {};
    }
};

module.exports = {
    createEvent,
    updateEvent,
    getEventById,
    getAllEvents,
    deleteEvent,
    getUpcomingEventsForStudent,
    getAllEventsForStudent,
    getEventByIdForStudent,
    getZoomMeetingDetails
};
