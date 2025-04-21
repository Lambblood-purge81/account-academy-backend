const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
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
        studentId: {
            type: String,
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
        coachingTrajectory: {
            type: String,
            required: true
        },
        coursesRoadmap: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
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

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
