const mongoose = require('mongoose');
const { COACH } = require('../helpers/constant-enums');

const coachSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
            unique: true
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
        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            }
        ],
        coachType: {
            type: String,
            enum: [COACH.COACH_TYPE.HIGH_TICKET, COACH.COACH_TYPE.LOW_TICKET],
            required: true
        },
        highTicketStudentSpots: {
            type: Number,
            default: 0,
            required: function () {
                return this.coachType === COACH.COACH_TYPE.HIGH_TICKET;
            }
        },
        lowTicketStudentSpots: {
            type: Number,
            default: 0,
            required: function () {
                return this.coachType === COACH.COACH_TYPE.LOW_TICKET;
            }
        },
        bio: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Coach = mongoose.model('Coach', coachSchema);
module.exports = Coach;
