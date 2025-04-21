const { Joi, Segments } = require("celebrate");

const createCourse = {
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().required(),
    subtitle: Joi.string().optional().allow("", null),
    category: Joi.string().required(),
    moduleManager: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    thumbnail: Joi.string().optional(),
    trailer: Joi.string().optional().allow("", null),
    description: Joi.string().optional(),
    enrolledStudents: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional(),
  }),
};

const updateCourse = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().optional(),
    subtitle: Joi.string().optional().allow("", null),
    category: Joi.string().optional(),
    moduleManager: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    thumbnail: Joi.string().optional(),
    trailer: Joi.string().optional().allow("", null),
    description: Joi.string().optional(),
    isArchived: Joi.boolean().optional(),
    isPublished: Joi.boolean().optional(),
    enrolledStudents: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional(),
  }),
};

const getCourseById = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

const deleteCourse = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

module.exports = {
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourse,
};
