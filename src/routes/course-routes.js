const express = require('express');
const courseRouter = express.Router();
const { celebrate } = require('celebrate');
const audit = require('../middleware/audit');
const CourseController = require('../controllers/course-controller');
const CourseValidator = require('../request-schemas/course-schema');
const checkAuth = require('../middleware/check-auth');
const authorizedRoles = require('../middleware/authorized-roles');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const checkObjectId = require('../helpers/check-object-id');
const checkActive = require('../middleware/check-active');

const API = {
    CREATE_COURSE: '/create',
    UPDATE_COURSE: '/update/:id',
    GET_COURSE: '/:id',
    GET_ALL_COURSES: '/',
    DELETE_COURSE: '/delete/:id',
    ARCHIVE_COURSE: '/archive/:id',
    UNARCHIVE_COURSE: '/unarchive/:id',
    GET_ALL_STUDENTS_IN_COURSE: '/students/:courseId',
    GET_STUDENT_PROGRESS: '/progress/:courseId/:studentId',
    GET_ENROLLED_COURSES: '/enrolled',
    GET_COURSE_PREVIEW: '/preview/:id',
    PUBLISH_COURSE: '/publish/:id'
};

courseRouter.post(
    API.CREATE_COURSE,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(CourseValidator.createCourse),
    CourseController.createCourse
);

courseRouter.put(
    API.UPDATE_COURSE,
    audit,
    checkAuth,
    checkActive,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    celebrate(CourseValidator.updateCourse),
    CourseController.updateCourse
);

courseRouter.put(API.PUBLISH_COURSE, audit, checkAuth, checkActive, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), CourseController.publishCourse);

courseRouter.get(
    API.GET_ALL_COURSES,
    audit,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH, CONSTANT_ENUM.USER_ROLE.STUDENT]),
    CourseController.getAllCourses
);

courseRouter.get(API.GET_ALL_STUDENTS_IN_COURSE, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), CourseController.getAllStudentsInCourse);

courseRouter.get(API.GET_ENROLLED_COURSES, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]), CourseController.getEnrolledCourses);

courseRouter.delete(API.DELETE_COURSE, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CourseValidator.deleteCourse), CourseController.deleteCourse);

courseRouter.put(API.ARCHIVE_COURSE, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CourseValidator.getCourseById), CourseController.archiveCourse);

courseRouter.put(API.UNARCHIVE_COURSE, audit, checkObjectId, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]), celebrate(CourseValidator.getCourseById), CourseController.unarchiveCourse);

courseRouter.get(API.GET_STUDENT_PROGRESS, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]), CourseController.getStudentProgress);

courseRouter.get(
    API.GET_COURSE,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH, CONSTANT_ENUM.USER_ROLE.STUDENT]),
    celebrate(CourseValidator.getCourseById),
    CourseController.getCourseById
);
courseRouter.get(
    API.GET_COURSE_PREVIEW,
    audit,
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.STUDENT]),
    celebrate(CourseValidator.getCourseById),
    CourseController.getCoursePreview
);

module.exports = courseRouter;
