const mongoose = require("mongoose");
const { COURSE_STATUS, USER_ROLE } = require("../helpers/constant-enums");
const UserService = require("../services/user-services");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: false,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    moduleManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const user = await UserService.getUserByID(value);
          return (
            user &&
            (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.COACH)
          );
        },
        message: "Module Manager must be a user with role admin or coach",
      },
    },
    thumbnail: {
      type: String,
      default: "",
    },
    trailer: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        COURSE_STATUS.DRAFT,
        COURSE_STATUS.PUBLISHED,
        COURSE_STATUS.ARCHIVED,
      ],
      default: COURSE_STATUS.DRAFT,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
