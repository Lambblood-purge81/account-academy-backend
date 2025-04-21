const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helpers/constant-enums');
const bcrypt = require('bcrypt');

const options = { discriminatorKey: 'role', timestamps: true };

// Base user schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: [CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.COACH, CONSTANT_ENUM.USER_ROLE.STUDENT],
            required: true,
            default: CONSTANT_ENUM.USER_ROLE.STUDENT
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            required: function () {
                return this.platform === CONSTANT_ENUM.PLATFORMS.EMAIL;
            }
        },
        lastVisit: {
            type: Date,
            default: null
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        region: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        typeOfEvent: {
            type: String,
            enum: [CONSTANT_ENUM.EVENT.EVENT_TYPE.ONLINE, CONSTANT_ENUM.EVENT.EVENT_TYPE.ONSITE, CONSTANT_ENUM.EVENT.EVENT_TYPE.ONE_ON_ONE],
            required: false
        },
        meetingLink: {
            type: String,
            required: function () {
                return this.typeOfEvent === CONSTANT_ENUM.EVENT.EVENT_TYPE.ONLINE || this.typeOfEvent === CONSTANT_ENUM.EVENT.EVENT_TYPE.ONE_ON_ONE;
            }
        },
        location: {
            type: String,
            required: function () {
                return this.typeOfEvent === CONSTANT_ENUM.EVENT.EVENT_TYPE.ONSITE;
            }
        },
        googleTokens: {
            access_token: String,
            refresh_token: String,
            expiry_date: Number,
            token_type: String,
            scope: String
        },
        accountId: {
            type: String,
            default: ''
        },
        clientId: {
            type: String,
            default: ''
        },
        clientSecret: {
            type: String,
            default: ''
        }
    },
    options
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || !this.password) {
        throw new Error('Missing data for password comparison');
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.pre(['updateOne', 'findByIdAndUpdate', 'findOneAndUpdate'], async function (next) {
    const data = this.getUpdate();
    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }
    next();
});

// Base user model
const User = mongoose.model('User', userSchema);

// Coach-specific schema
const coachSchema = new mongoose.Schema(
    {
        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        coachType: {
            type: String,
            enum: [CONSTANT_ENUM.COACH.COACH_TYPE.HIGH_TICKET, CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET],
            required: true
        },
        highTicketStudentSpots: {
            type: Number,
            default: 0,
            required: function () {
                return this.coachType === CONSTANT_ENUM.COACH.COACH_TYPE.HIGH_TICKET;
            }
        },
        lowTicketStudentSpots: {
            type: Number,
            default: 0,
            required: function () {
                return this.coachType === CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET;
            }
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bio: {
            type: String,
            default: ''
        }
    },
    options
);

// Student-specific schema
const studentSchema = new mongoose.Schema(
    {
        assignedCoach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        coachingTrajectory: {
            type: String,
            required: true,
            enum: [CONSTANT_ENUM.COACH.COACH_TYPE.HIGH_TICKET, CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET],
            default: CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET
        },
        coursesRoadmap: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ]
    },
    options
);

// Discriminators for Coach and Student
const Coach = User.discriminator(CONSTANT_ENUM.USER_ROLE.COACH, coachSchema);
const Student = User.discriminator(CONSTANT_ENUM.USER_ROLE.STUDENT, studentSchema);
const Admin = User.discriminator(CONSTANT_ENUM.USER_ROLE.ADMIN, studentSchema);

module.exports = { User, Coach, Student, Admin };
