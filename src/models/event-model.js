const mongoose = require('mongoose');
const { EVENT } = require('../helpers/constant-enums');

const eventSchema = new mongoose.Schema(
    {
        topic: {
            type: String,
            required: true
        },
        dateTime: {
            type: Date,
            required: true
        },
        timeZone: {
            type: String,
            default: 'UTC'
        },
        eventHost: {
            type: String,
            required: true,
            default: ''
        },
        meetingLink: {
            type: String,
            required: function () {
                return this.typeOfEvent === EVENT.EVENT_TYPE.ONLINE || this.typeOfEvent === EVENT.EVENT_TYPE.ONE_ON_ONE;
            }
        },
        location: {
            type: String,
            required: function () {
                return this.typeOfEvent === EVENT.EVENT_TYPE.ONSITE;
            }
        },
        typeOfEvent: {
            type: String,
            enum: [EVENT.EVENT_TYPE.ONLINE, EVENT.EVENT_TYPE.ONSITE, EVENT.EVENT_TYPE.ONE_ON_ONE],
            required: true
        },
        attendees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        thumbnail: {
            type: String,
            default: ''
        },
        googleCalendarEventId: {
            type: String,
            default: ''
        },
        reason: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
