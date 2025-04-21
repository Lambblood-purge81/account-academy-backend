const { Joi, Segments } = require('celebrate');
const { COACH } = require('../helpers/constant-enums');

const createCoach = {
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        region: Joi.string().required(),
        country: Joi.string().required(),
        assignedStudents: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .optional()
            .allow(null),
        coachType: Joi.string().valid(COACH.COACH_TYPE.HIGH_TICKET, COACH.COACH_TYPE.LOW_TICKET).required(),
        highTicketStudentSpots: Joi.when('coachType', {
            is: COACH.COACH_TYPE.HIGH_TICKET,
            then: Joi.number().required(),
            otherwise: Joi.forbidden()
        }),
        lowTicketStudentSpots: Joi.when('coachType', {
            is: COACH.COACH_TYPE.LOW_TICKET,
            then: Joi.number().required(),
            otherwise: Joi.forbidden()
        }),
        avatar: Joi.string().optional().allow(null),
        bio: Joi.string().optional().allow(null).allow('')
    })
};

const updateCoach = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    }),
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
        region: Joi.string().optional(),
        country: Joi.string().optional(),
        assignedStudents: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .optional()
            .allow(null),
        coachType: Joi.string().valid(COACH.COACH_TYPE.HIGH_TICKET, COACH.COACH_TYPE.LOW_TICKET).optional(),
        highTicketStudentSpots: Joi.when('coachType', {
            is: COACH.COACH_TYPE.HIGH_TICKET,
            then: Joi.number().optional(),
            otherwise: Joi.forbidden()
        }),
        lowTicketStudentSpots: Joi.when('coachType', {
            is: COACH.COACH_TYPE.LOW_TICKET,
            then: Joi.number().optional(),
            otherwise: Joi.forbidden()
        }),
        bio: Joi.string().optional().allow(null).allow(''),
        isActive: Joi.boolean().optional(),
        avatar: Joi.string().optional().allow(null)
    })
};

const getCoachById = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

const deleteCoach = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

module.exports = {
    createCoach,
    updateCoach,
    getCoachById,
    deleteCoach
};
