const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helpers/constant-enums');

const createStudent = {
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        region: Joi.string().required(),
        country: Joi.string().required(),
        coachingTrajectory: Joi.string().valid(CONSTANT_ENUM.COACH.COACH_TYPE.HIGH_TICKET, CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET).required(),
        coursesRoadmap: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .optional(),
        avatar: Joi.string().optional().allow('').allow(null)
    })
};

const updateStudent = {
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
        coachingTrajectory: Joi.string().optional(),
        coursesRoadmap: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .optional(),
        avatar: Joi.string().optional().optional().allow('').allow(null),
        isActive: Joi.boolean().optional()
    })
};

const getStudentById = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

const deleteStudent = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

module.exports = {
    createStudent,
    updateStudent,
    getStudentById,
    deleteStudent
};
