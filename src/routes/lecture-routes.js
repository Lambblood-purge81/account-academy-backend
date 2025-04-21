const express = require('express');
const lectureRouter = express.Router();
const { celebrate } = require('celebrate');
const audit = require('../middleware/audit');
const LectureController = require('../controllers/lecture-controller');
const LectureValidator = require('../request-schemas/lecture-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkObjectId = require('../helpers/check-object-id');
const checkActive = require('../middleware/check-active');

const API = {
    ADD_LECTURE: '/add',
    UPDATE_LECTURE: '/update/:id',
    DELETE_LECTURE: '/delete/:id',
    MARK_LECTURE_COMPLETED: '/mark-completed/:id',
    // Student
    PERFORM_QUIZ: '/quiz/:id',
    GET_LECTURE: '/:id',
    GET_ALL_LECTURES: '/'
};

lectureRouter.post(
    API.ADD_LECTURE,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(LectureValidator.addLecture),
    LectureController.addLecture
);

lectureRouter.put(
    API.UPDATE_LECTURE,
    audit,
    checkObjectId,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    // celebrate(LectureValidator.updateLecture),
    LectureController.updateLecture
);

lectureRouter.delete(
    API.DELETE_LECTURE,
    audit,
    checkObjectId,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(LectureValidator.deleteLecture),
    LectureController.deleteLecture
);

lectureRouter.put(API.MARK_LECTURE_COMPLETED, audit, checkObjectId, checkActive, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), LectureController.markLectureAsCompleted);

// Student
lectureRouter.put(
    API.PERFORM_QUIZ,
    audit,
    checkObjectId,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]),
    celebrate(LectureValidator.performQuiz),
    LectureController.performQuiz
);

lectureRouter.get(
    API.GET_LECTURE,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH, CONSTANT_ENUM.USER_ROLE.STUDENT]),
    celebrate(LectureValidator.getLectureById),
    LectureController.getLectureById
);
lectureRouter.get(
    API.GET_ALL_LECTURES,
    audit,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH, CONSTANT_ENUM.USER_ROLE.STUDENT]),
    LectureController.getAllLectures
);

module.exports = lectureRouter;
