const StudentService = require('../services/student-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { Student } = require('../models/user-model');
const Course = require('../models/course-model');
const { wrapAsync } = require('../utils/wrapAsync');
const { USER_ROLE, COURSE_STATUS } = require('../helpers/constant-enums');
const { generatePassword, isEmpty } = require('../utils/utils');
const MAIL_HANDLER = require('../mails/mails');

// Create Student
const createStudent = wrapAsync(async (req, res) => {
    const { role } = req.user;
    const studentData = req.body;

    // Check if email already exists
    const emailExists = await Student.findOne({ email: studentData.email });
    if (emailExists) {
        throw new ErrorHandler(400, 'Email already exists');
    }

    // Draft courses should not be assigned to students
    if (studentData.coursesRoadmap && studentData.coursesRoadmap.length > 0) {
        // find all the courses by id's in coursesRoadmap
        const courses = await Course.find({ _id: { $in: studentData.coursesRoadmap } });
        // check if any course is draft
        const draftCourse = courses.find((course) => course.status === COURSE_STATUS.DRAFT);
        if (draftCourse) {
            throw new ErrorHandler(400, 'Draft courses cannot be assigned to students');
        }
    }

    if (role === USER_ROLE.COACH) {
        studentData.assignedCoach = req.user._id;
    }

    const newStudent = await StudentService.createStudent({ ...studentData, role: USER_ROLE.STUDENT, createdBy: req.user._id });

    // Update the course collection by pushing the new student in enrolledStudent Array (student is enrolled in the course)
    if (studentData.coursesRoadmap && studentData.coursesRoadmap.length > 0) {
        await Course.updateMany({ _id: { $in: studentData.coursesRoadmap } }, { $push: { enrolledStudents: newStudent._id } });
    }

    // set random password to student email
    const randomPassword = generatePassword(8);
    // Automatically generate salted password
    newStudent.password = randomPassword;
    await newStudent.save();

    MAIL_HANDLER.sendEmailToUserWithPassword(newStudent?.email, 'Student Account Created', 'Your account has been created successfully.', randomPassword);

    // send student without password
    newStudent.password = undefined;
    delete newStudent.password;

    sendResponse(res, 201, newStudent, 'Student created successfully');
});

// Update Student
const updateStudent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const student = await Student.findById(id);
    if (isEmpty(student)) throw new ErrorHandler(404, 'Student not found');

    if (updateData.email) {
        throw new ErrorHandler(400, 'Email cannot be updated');
    }

    if (updateData.coursesRoadmap && updateData.coursesRoadmap.length > 0) {
        // find all the courses by id's in coursesRoadmap
        const courses = await Course.find({ _id: { $in: updateData.coursesRoadmap } });
        // check if any course is draft
        const draftCourse = courses.find((course) => course.status === COURSE_STATUS.DRAFT);
        // Draft courses should not be assigned to students
        if (draftCourse) {
            throw new ErrorHandler(400, 'Draft courses cannot be assigned to students');
        } else {
            // Update the course collection by pushing the new student in enrolledStudent Array (student is enrolled in the course)
            await Course.updateMany({ _id: { $in: updateData.coursesRoadmap } }, { $push: { enrolledStudents: student._id } });
        }
    }

    // if coachingTrajectory is updated, then unassign the student from the previous coach and unassign the student from the previous courses
    if (updateData.coachingTrajectory && updateData.coachingTrajectory !== student.coachingTrajectory) {
        // Unassign the student from the previous coach
        if (student.assignedCoach) {
            await StudentService.unassignStudentFromCoach(student.assignedCoach, student._id);
        }

        // Unassign the student from the previous courses
        if (student.coursesRoadmap && student.coursesRoadmap.length > 0) {
            await Course.updateMany({ _id: { $in: student.coursesRoadmap } }, { $pull: { enrolledStudents: student._id } });
        }

        // remove the coursesRoadmap from the student
        updateData.coursesRoadmap = [];
    }

    const updatedStudent = await StudentService.updateStudent(id, updateData);

    if (!updatedStudent) throw new ErrorHandler(404, 'Student not found');
    sendResponse(res, 200, updatedStudent, 'Student updated successfully');
});

// Get Student by ID
const getStudentById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const student = await StudentService.getStudentById(id);
    if (!student) throw new ErrorHandler(404, 'Student not found');
    sendResponse(res, 200, student, 'Student fetched successfully');
});

// Get all Students
const getAllStudents = wrapAsync(async (req, res) => {
    const user = req.user;
    const { role } = user;

    const { page = 1, limit = 10, ...rest } = req.query;

    // Coach can only see students assigned to him
    if (role === USER_ROLE.COACH) {
        rest.assignedCoach = user._id;
    }

    const students = await StudentService.getAllStudents(rest, page, limit);

    return res.status(200).json({
        data: students.students,
        total: students.total,
        page: students.page,
        limit: students.limit,
        message: 'Students fetched successfully'
    });
});

// Delete Student
const deleteStudent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedStudent = await StudentService.deleteStudent(id);
    if (!deletedStudent) throw new ErrorHandler(404, 'Student not found');
    sendResponse(res, 200, null, 'Student deleted successfully');
});

// Deactivate Student
const deactivateStudent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedStudent = await StudentService.deactivateStudent(id);
    if (!updatedStudent) throw new ErrorHandler(404, 'Student not found');
    sendResponse(res, 200, updatedStudent, 'Student deactivated successfully');
});

// Activate Student
const activateStudent = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedStudent = await StudentService.activateStudent(id);
    if (!updatedStudent) throw new ErrorHandler(404, 'Student not found');
    sendResponse(res, 200, updatedStudent, 'Student activated successfully');
});

// Get all Students
const getStudentsHaveNoCoach = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, coachId = null, ...rest } = req.query;

    if (coachId) {
        rest.$or = [
            { assignedCoach: coachId }, // Students already assigned to the coach
            { assignedCoach: { $exists: false } } // Students not assigned to any coach
        ];
    } else {
        // Default behavior (create new coach scenario)
        rest.assignedCoach = { $exists: false }; // Only students not assigned to any coach
    }

    const students = await StudentService.getStudentsHaveNoCoach(rest, page, limit);

    return res.status(200).json({
        data: students.students,
        total: students.total,
        page: students.page,
        limit: students.limit,
        message: 'Students fetched successfully'
    });
});

module.exports = {
    createStudent,
    updateStudent,
    getStudentById,
    getAllStudents,
    deleteStudent,
    deactivateStudent,
    activateStudent,
    getStudentsHaveNoCoach
};
