const { Joi, Segments } = require('celebrate');

const sendOTPonEmail = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        })
    })
};

const verifyOTP = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),
        otp: Joi.number().required().messages({
            'any.required': 'OTP is required'
        })
    })
};

const updateEmailPassword = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown(),
    [Segments.BODY]: Joi.object().keys({
        password: Joi.string()
            .min(8)
            .pattern(/(?=.*[a-z])/, 'lowercase')
            .pattern(/(?=.*[A-Z])/, 'uppercase')
            .pattern(/(?=.*[0-9])/, 'number')
            .pattern(/(?=.*[!@#$%^&*])/, 'special')
            .required()
            .label('Password')
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.name': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
                'any.required': 'Password is required'
            }),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm Password').messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm Password is required'
        })
    })
};

const getAllUsers = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown()
};

const getUser = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string().required().messages({
            'any.required': 'ID is required'
        })
    })
};

const loginWithEmail = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required'
        })
    })
};
const updateProfile = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown(),
    [Segments.BODY]: Joi.object()
        .keys({
            name: Joi.string().max(50).optional().label('Name').messages({
                'string.max': 'Name must be at most 50 characters long',
                'any.required': 'Name is required'
            }),
            phoneNumber: Joi.string().optional().label('Phone Number').messages({
                'any.required': 'Phone Number is required'
            }),
            region: Joi.string().optional().messages({
                'any.required': 'Region is required'
            }),
            country: Joi.string().optional().messages({
                'any.required': 'Country is required'
            }),
            avatar: Joi.string().optional(),
            currentPassword: Joi.string().optional().label('Current Password').messages({
                'string.empty': 'Current Password cannot be empty'
            }),
            newPassword: Joi.string().optional().label('New Password').min(8).messages({
                'string.min': 'New Password must be at least 8 characters long'
            }),
            meetingLink: Joi.string().optional().label('Meeting Link').messages({
                'any.required': 'Meeting Link is required'
            }),
            clientId: Joi.string().optional().allow(null, ''),
            accountId: Joi.string().optional().allow(null, ''),
            clientSecret: Joi.string().optional().allow(null, '')
        })
        .with('newPassword', 'currentPassword')
};

const updateUser = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown(),
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string().required().messages({
            'any.required': 'ID is required'
        })
    }),
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().max(50).required().label('Name').messages({
            'string.max': 'Name must be at most 50 characters long',
            'any.required': 'Name is required'
        }),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]+$/, 'numbers')
            .required()
            .label('Phone Number')
            .messages({
                'string.pattern.name': 'Phone Number must contain only numbers',
                'any.required': 'Phone Number is required'
            }),
        region: Joi.string().required().messages({
            'any.required': 'Region is required'
        }),
        country: Joi.string().required().messages({
            'any.required': 'Country is required'
        }),
        avatar: Joi.string().optional()
    })
};

const deleteUser = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown(),
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string().required().messages({
            'any.required': 'ID is required'
        })
    })
};

const deleteAccount = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown()
};

const getUserFromToken = {
    [Segments.BODY]: Joi.object().keys({
        token: Joi.string().required().messages({
            'any.required': 'Token is required'
        })
    })
};

const getUsers = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            authorization: Joi.string().required()
        })
        .unknown()
};

const setCoursesRoadmap = {
    [Segments.PARAMS]: Joi.object().keys({
        studentId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    }),
    [Segments.BODY]: Joi.object().keys({
        coursesRoadmap: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .required()
    })
};

const UserValidator = {
    sendOTPonEmail,
    verifyOTP,
    updateEmailPassword,
    getAllUsers,
    getUser,
    loginWithEmail,
    updateProfile,
    updateUser,
    deleteUser,
    deleteAccount,
    getUserFromToken,
    getUsers,
    setCoursesRoadmap
};

module.exports = UserValidator;
