const CourseService = require('../services/course-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const { COURSE_STATUS } = require('../helpers/constant-enums');
const CONSTANT_ENUM = require('../helpers/constant-enums');

// Create Course
const createCourse = wrapAsync(async (req, res) => {
    const courseData = req.body;
    const newCourse = await CourseService.createCourse(courseData);
    sendResponse(res, 201, newCourse, 'Course created successfully');
});

// Update Course
const updateCourse = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedCourse = await CourseService.updateCourse(id, updateData);
    if (!updatedCourse) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, updatedCourse, 'Course updated successfully');
});

const publishCourse = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const course = await CourseService.getCourseById(id, user);
    if (!course) throw new ErrorHandler(404, 'Course not found');

    let message = '';

    if (course.status !== COURSE_STATUS.PUBLISHED && !course.isPublished) {
        course.isPublished = true;
        course.status = COURSE_STATUS.PUBLISHED;
        await course.save();
        message = 'Course published successfully';
    } else if (course.status === COURSE_STATUS.PUBLISHED && course.isPublished) {
        message = 'Course updated successfully';
    }

    sendResponse(res, 200, course, message);
});

// Get Course by ID
const getCourseById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const course = await CourseService.getCourseById(id, user);
    if (!course) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, course, 'Course fetched successfully');
});

// Get all Courses
const getAllCourses = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...rest } = req.query;
    const user = req.user;

    let courses = [];

    if (user.role === CONSTANT_ENUM.USER_ROLE.STUDENT && rest.isEnrolled === 'true') {
        courses = await CourseService.getEnrolledCourses(rest, page, limit, user);
    } else if (user.role === CONSTANT_ENUM.USER_ROLE.STUDENT && rest.isEnrolled === 'false') {
        // Set the courses roadmap order while getting the courses | Student Dashboard
        courses = await CourseService.getAllCoursesOnStudentDashboard(rest, page, limit, user);
    } else {
        courses = await CourseService.getAllCourses(rest, page, limit);
    }

    return res.status(200).json({
        data: courses?.courses,
        total: courses?.total,
        page: courses?.page,
        limit: courses?.limit,
        message: 'Courses fetched successfully'
    });
});

// Delete Course
const deleteCourse = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCourse = await CourseService.deleteCourse(id);
    if (!deletedCourse) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, null, 'Course deleted successfully');
});

// Archive Course
const archiveCourse = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCourse = await CourseService.archiveCourse(id);
    if (!updatedCourse) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, updatedCourse, 'Course activated successfully');
});

// Unarchive Course
const unarchiveCourse = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCourse = await CourseService.unarchiveCourse(id);
    if (!updatedCourse) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, updatedCourse, 'Course deactivated successfully');
});

// Get all Students in a Course
const getAllStudentsInCourse = wrapAsync(async (req, res) => {
    const { courseId } = req.params;
    const students = await CourseService.getAllStudentsInCourse(courseId);
    sendResponse(res, 200, students, 'Students fetched successfully');
});

// Get progress of a student in a course
const getStudentProgress = wrapAsync(async (req, res) => {
    const { courseId, studentId } = req.params;
    const progress = await CourseService.getStudentProgress(courseId, studentId);
    sendResponse(res, 200, progress, 'Student progress fetched successfully');
});

// Student Dashboard
const getEnrolledCourses = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...rest } = req.query;
    const courses = await CourseService.getEnrolledCourses(rest, page, limit, req.user._id);
    const data = {
        data: courses.courses,
        total: courses.total,
        page: courses.page,
        limit: courses.limit,
        message: 'Courses fetched successfully'
    };

    sendResponse(res, 200, data, 'Student progress fetched successfully');
});
// Get Course Preview
const getCoursePreview = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const course = await CourseService.getCoursePreviewById(id);

    if (!course) throw new ErrorHandler(404, 'Course not found');
    sendResponse(res, 200, course, 'Course preview fetched successfully');
});

module.exports = {
    createCourse,
    updateCourse,
    getCourseById,
    getAllCourses,
    deleteCourse,
    archiveCourse,
    unarchiveCourse,
    getAllStudentsInCourse,
    getStudentProgress,
    getEnrolledCourses,
    getCoursePreview,
    publishCourse
};
