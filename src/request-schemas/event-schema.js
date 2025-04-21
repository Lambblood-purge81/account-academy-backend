const { Joi, Segments } = require('celebrate');
const { EVENT } = require('../helpers/constant-enums');

const createEvent = {
    [Segments.BODY]: Joi.object().keys({
        topic: Joi.string().required().messages({
            'any.required': 'Event topic is required'
        }),
        dateTime: Joi.date().required().messages({
            'any.required': 'Event date and time are required'
        }),
        eventHost: Joi.string().optional(),
        meetingLink: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONLINE,
            then: Joi.required().messages({
                'any.required': 'Meeting link is required for online events'
            }),
            otherwise: Joi.forbidden()
        }),
        location: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONSITE,
            then: Joi.required().messages({
                'any.required': 'Location is required for onsite events'
            }),
            otherwise: Joi.forbidden()
        }),
        typeOfEvent: Joi.string().valid(EVENT.EVENT_TYPE.ONLINE, EVENT.EVENT_TYPE.ONSITE).required().messages({
            'any.required': 'Event type is required'
        }),
        attendees: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Attendee ID must be a valid 24-character hexadecimal string'
                    })
            )
            .optional(),
        thumbnail: Joi.string().optional().allow('').allow(null)
    })
};

const requestMeeting = {
    [Segments.BODY]: Joi.object().keys({
        topic: Joi.string().required().messages({
            'any.required': 'Meeting topic is required'
        }),
        dateTime: Joi.date().required().messages({
            'any.required': 'Meeting date and time are required'
        }),
        eventHost: Joi.string().optional(),
        meetingLink: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONLINE,
            then: Joi.required().messages({
                'any.required': 'Meeting link is required for online events'
            }),
            otherwise: Joi.forbidden()
        }),
        location: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONSITE,
            then: Joi.required().messages({
                'any.required': 'Location is required for onsite events'
            }),
            otherwise: Joi.forbidden()
        }),
        typeOfEvent: Joi.string().valid(EVENT.EVENT_TYPE.ONLINE, EVENT.EVENT_TYPE.ONSITE).required().messages({
            'any.required': 'Event type is required'
        }),
        thumbnail: Joi.string().optional().allow('').allow(null),
        reason: Joi.string().optional(),
        attendees: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Attendee ID must be a valid 24-character hexadecimal string'
                    })
            )
            .optional(),
        timeZone: Joi.string().optional()
    })
};

const updateEvent = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Event ID must be a valid 24-character hexadecimal string',
                'any.required': 'Event ID is required'
            })
    }),
    [Segments.BODY]: Joi.object().keys({
        topic: Joi.string().optional(),
        dateTime: Joi.date().optional(),
        eventHost: Joi.string().optional(),
        meetingLink: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONLINE,
            then: Joi.required().messages({
                'any.required': 'Meeting link is required for online events'
            }),
            otherwise: Joi.forbidden()
        }),
        location: Joi.string().when('typeOfEvent', {
            is: EVENT.EVENT_TYPE.ONSITE,
            then: Joi.required().messages({
                'any.required': 'Location is required for onsite events'
            }),
            otherwise: Joi.forbidden()
        }),
        typeOfEvent: Joi.string().valid(EVENT.EVENT_TYPE.ONLINE, EVENT.EVENT_TYPE.ONSITE).optional(),
        attendees: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Attendee ID must be a valid 24-character hexadecimal string'
                    })
            )
            .optional(),
        thumbnail: Joi.string().optional().allow(null, '')
    })
};

const getEventById = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Event ID must be a valid 24-character hexadecimal string',
                'any.required': 'Event ID is required'
            })
    })
};

const deleteEvent = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Event ID must be a valid 24-character hexadecimal string',
                'any.required': 'Event ID is required'
            })
    })
};

module.exports = {
    createEvent,
    requestMeeting,
    updateEvent,
    getEventById,
    deleteEvent
};
