const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        quiz: {
            mcqs: [
                {
                    question: String,
                    options: [String],
                    correctAnswer: String,
                    studentsAnswers: [
                        {
                            studentId: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'User'
                            },
                            answer: String,
                            // If the student's answer is correct upto 50% then the result will be true
                            result: {
                                type: Boolean,
                                default: false
                            }
                        }
                    ]
                }
            ]
        },
        vimeoVideoData: {
            type: Object,
            default: null
        },
        vimeoLink: {
            type: String,
            default: ''
        },
        file: {
            type: String,
            required: false,
            default: ''
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        completedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
);

const Lecture = mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;
