const express = require('express');
const coachRouter = express.Router();
const { celebrate } = require('celebrate');
const audit = require('../middleware/audit');
const CoachController = require('../controllers/coach-controller');
const CoachValidator = require('../request-schemas/coach-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkObjectId = require('../helpers/check-object-id');

const API = {
    CREATE_COACH: '/create',
    UPDATE_COACH: '/update/:id',
    GET_COACH: '/:id',
    DELETE_COACH: '/delete/:id',
    DEACTIVATE_COACH: '/deactivate/:id',
    ACTIVATE_COACH: '/activate/:id',
    GET_ALL_COACHES: '/'
};

coachRouter.post(API.CREATE_COACH, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CoachValidator.createCoach), CoachController.createCoach);

coachRouter.put(API.UPDATE_COACH, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CoachValidator.updateCoach), CoachController.updateCoach);

coachRouter.get(
    API.GET_COACH,
    audit,
    checkObjectId,
    checkAuth,
    // student can also get coach details for req a meeting
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.STUDENT, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(CoachValidator.getCoachById),
    CoachController.getCoachById
);

coachRouter.get(API.GET_ALL_COACHES, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), CoachController.getAllCoaches);

coachRouter.delete(API.DELETE_COACH, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CoachValidator.deleteCoach), CoachController.deleteCoach);

coachRouter.put(API.DEACTIVATE_COACH, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CoachValidator.getCoachById), CoachController.deactivateCoach);

coachRouter.put(API.ACTIVATE_COACH, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CoachValidator.getCoachById), CoachController.activateCoach);

module.exports = coachRouter;
