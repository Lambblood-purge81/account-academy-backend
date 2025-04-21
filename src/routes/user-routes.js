const express = require('express');
const userRouter = express.Router();
const audit = require('../middleware/audit');
const { celebrate } = require('celebrate');
const UserController = require('../controllers/user-controllers');
const UserValidator = require('../request-schemas/user-schema.js');
const checkAuth = require('../middleware/check-auth.js');
const authorizedRoles = require('../middleware/authorized-roles.js');
const CONSTANT_ENUM = require('../helpers/constant-enums.js');
const checkObjectId = require('../helpers/check-object-id');
const checkResourceExists = require('../middleware/check-resource-exists.js');

const API = {
    GET_ALL_USERS: '/',
    SEND_OTP_ON_EMAIL: '/send/otp/email',
    VERIFY_OTP: '/verify-otp',
    UPDATE_EMAIL_PASSWORD: '/update/password',
    LOGIN_EMAIL: '/login/email',
    UPDATE_USER: '/user/edit/:id',
    UPDATE_PROFILE: '/profile',
    DELETE_ACCOUNT: '/delete-account',
    DELETE_USER: '/delete/:id',
    DROP_COLLECTION: '/drop',
    DECODE_TOKEN: '/token',
    SET_COURSES_ROADMAP: '/set-courses-roadmap/:studentId',
    GET_USER: '/:id'
};

userRouter.post(API.DECODE_TOKEN, audit, celebrate(UserValidator.getUserFromToken), UserController.getUserFromToken);

userRouter.get(
    API.GET_ALL_USERS,
    audit,
    celebrate(UserValidator.getUsers),
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.SUPER_ADMIN]),
    UserController.getAllUsers
);

userRouter.get(
    API.GET_USER,
    audit,
    celebrate(UserValidator.getUser),
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.SUPER_ADMIN]),
    UserController.getUser
);

userRouter.put(API.SEND_OTP_ON_EMAIL, audit, celebrate(UserValidator.sendOTPonEmail), UserController.sendOtpOnEmail);

userRouter.put(API.VERIFY_OTP, audit, celebrate(UserValidator.verifyOTP), UserController.verifyOTP);

userRouter.put(API.UPDATE_EMAIL_PASSWORD, audit, celebrate(UserValidator.updateEmailPassword), checkAuth, UserController.updateEmailPassword);

userRouter.post(API.LOGIN_EMAIL, audit, celebrate(UserValidator.loginWithEmail), UserController.loginWithEmail);

userRouter.put(
    API.UPDATE_USER,
    audit,
    celebrate(UserValidator.updateUser),
    checkObjectId,
    checkResourceExists('users'),
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.SUPER_ADMIN]),
    UserController.updateProfile
);

userRouter.put(API.UPDATE_PROFILE, audit, celebrate(UserValidator.updateProfile), checkAuth, UserController.updateProfile);

userRouter.put(API.DELETE_ACCOUNT, audit, celebrate(UserValidator.deleteAccount), checkAuth, UserController.deleteMyAccount);

userRouter.put(
    API.DELETE_USER,
    audit,
    celebrate(UserValidator.deleteUser),
    checkObjectId,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.SUPER_ADMIN]),
    UserController.deleteUser
);

userRouter.post(API.DROP_COLLECTION, audit, checkAuth, authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.SUPER_ADMIN]), UserController.dropUserCollection);

userRouter.put(
    API.SET_COURSES_ROADMAP,
    audit,
    checkAuth,
    authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH]),
    checkObjectId,
    celebrate(UserValidator.setCoursesRoadmap),
    UserController.setCoursesRoadmap
);

module.exports = userRouter;
