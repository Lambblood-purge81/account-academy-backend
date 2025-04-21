const { Joi, Segments } = require('celebrate');

const addLecture = {
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        quiz: Joi.object()
            .keys({
                mcqs: Joi.array()
                    .items(
                        Joi.object().keys({
                            question: Joi.string().allow('').allow(null).optional(),
                            options: Joi.array().items(Joi.string().allow('').allow(null)).optional(),
                            correctAnswer: Joi.string().allow('').allow(null).optional()
                        })
                    )
                    .optional()
            })
            .optional(),
        courseId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
        videoFilePath: Joi.string().optional(),
        file: Joi.string().optional().allow('').allow(null),
        vimeoLink: Joi.string().optional().allow('', null)
    })
};

const getLectureById = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

const updateLecture = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    }),
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().optional(),
        _id: Joi.string().optional(),
        description: Joi.string().optional(),
        quiz: Joi.object()
            .keys({
                mcqs: Joi.array()
                    .items(
                        Joi.object().keys({
                            question: Joi.string().allow('').allow(null).optional(),
                            options: Joi.array().items(Joi.string().allow('').allow(null)).optional(),
                            correctAnswer: Joi.string().allow('').allow(null).optional(),
                            _id: Joi.string().optional(),
                            studentsAnswers: Joi.array().optional()
                        })
                    )
                    .optional()
            })
            .optional(),
        file: Joi.string().optional(),
        vimeoLink: Joi.string().optional().allow('', null)
    })
};

const deleteLecture = {
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

const performQuiz = {
    [Segments.BODY]: Joi.object().keys({
        mcqs: Joi.array()
            .items(
                Joi.object().keys({
                    questionId: Joi.string()
                        .regex(/^[0-9a-fA-F]{24}$/)
                        .required(),
                    answer: Joi.string().required()
                })
            )
            .required()
    }),
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
    })
};

module.exports = {
    addLecture,
    getLectureById,
    updateLecture,
    deleteLecture,
    performQuiz
};
