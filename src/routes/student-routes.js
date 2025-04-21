const express = require('express');
const studentRouter = express.Router();
const { celebrate } = require('celebrate');
const audit = require('../middleware/audit');
const StudentController = require('../controllers/student-controller');
const StudentValidator = require('../request-schemas/student-schema');
const checkAuth = require('../middleware/check-auth');
const checkActive = require('../middleware/check-active');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkObjectId = require('../helpers/check-object-id');

const API = {
    CREATE_STUDENT: '/create',
    UPDATE_STUDENT: '/update/:id',
    GET_STUDENT: '/:id',
    GET_ALL_STUDENTS: '/',
    DELETE_STUDENT: '/delete/:id',
    DEACTIVATE_STUDENT: '/deactivate/:id',
    ACTIVATE_STUDENT: '/activate/:id',
    GET_ALL_STUDENTS_HAVE_NO_COACH: '/no-coach'
};

studentRouter.post(
    API.CREATE_STUDENT,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.createStudent),
    StudentController.createStudent
);

studentRouter.put(
    API.UPDATE_STUDENT,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.updateStudent),
    StudentController.updateStudent
);

studentRouter.get(API.GET_ALL_STUDENTS_HAVE_NO_COACH, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), StudentController.getStudentsHaveNoCoach);

studentRouter.get(API.GET_ALL_STUDENTS, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), StudentController.getAllStudents);

studentRouter.delete(
    API.DELETE_STUDENT,
    audit,
    checkObjectId,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.deleteStudent),
    StudentController.deleteStudent
);

studentRouter.put(
    API.DEACTIVATE_STUDENT,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.getStudentById),
    StudentController.deactivateStudent
);

studentRouter.put(
    API.ACTIVATE_STUDENT,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.getStudentById),
    StudentController.activateStudent
);

studentRouter.get(
    API.GET_STUDENT,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(StudentValidator.getStudentById),
    StudentController.getStudentById
);

module.exports = studentRouter;
