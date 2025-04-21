const CoachService = require('../services/coach-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { Student } = require('../models/user-model');
const { wrapAsync } = require('../utils/wrapAsync');
const { USER_ROLE, COACH } = require('../helpers/constant-enums');
const MAIL_HANDLER = require('../mails/mails');
const { generatePassword } = require('../utils/utils');

// Create Coach
const createCoach = wrapAsync(async (req, res) => {
    const coachData = req.body;

    // Check if email already exists
    const emailExists = await CoachService.getUserByEmail(coachData.email);
    if (emailExists) {
        throw new ErrorHandler(400, 'Email already exists');
    }

    // Validate assigned students if provided
    const studentIds = coachData.assignedStudents;
    if (studentIds && studentIds.length > 0) {
        await CoachService.checkAssignedStudents({ ...coachData, _id: emailExists?._id });
    }

    const newCoach = await CoachService.createCoach({ ...coachData, role: USER_ROLE.COACH });

    // Update many students to add this coach to them.
    await Student.updateMany({ _id: { $in: studentIds } }, { $set: { assignedCoach: newCoach._id } });

    // send random password to coach email
    const randomPassword = generatePassword(8);
    // Automatically generate salted password
    newCoach.password = randomPassword;
    await newCoach.save();

    MAIL_HANDLER.sendEmailToUserWithPassword(newCoach?.email, 'Coach Account Created', 'Your account has been created successfully', randomPassword);

    // send coach without password
    newCoach.password = undefined;
    delete newCoach.password;

    sendResponse(res, 201, newCoach, 'Coach created successfully');
});

// Update Coach
const updateCoach = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate assigned students if provided
    const studentIds = updateData.assignedStudents;
    if (studentIds && studentIds.length > 0) {
        await CoachService.checkAssignedStudents({ ...updateData, _id: id });
    }

    // reset the tickets
    if (updateData.coachType === COACH.COACH_TYPE.LOW_TICKET) {
        updateData.highTicketStudentSpots = 0;
    }

    if (updateData.coachType === COACH.COACH_TYPE.HIGH_TICKET) {
        updateData.lowTicketStudentSpots = 0;
    }

    const updatedCoach = await CoachService.updateCoach(id, updateData);

    // Update many students to add this coach to them.
    await Student.updateMany({ _id: { $in: studentIds } }, { $set: { assignedCoach: updatedCoach._id } });

    // if coach unassigned from students, remove coach from students
    if (updateData.assignedStudents === undefined || updateData.assignedStudents.length === 0) {
        await Student.updateMany({ assignedCoach: id }, { $unset: { assignedCoach: 1 } });
    }

    if (!updatedCoach) throw new ErrorHandler(404, 'Coach not found');
    sendResponse(res, 200, updatedCoach, 'Coach updated successfully');
});

// Get Coach by ID
const getCoachById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const coach = await CoachService.getCoachById(id);
    if (!coach) throw new ErrorHandler(404, 'Coach not found');
    sendResponse(res, 200, coach, 'Coach fetched successfully');
});

// Get all Coaches
const getAllCoaches = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...rest } = req.query;

    const coaches = await CoachService.getAllCoaches(rest, page, limit);

    return res.status(200).json({
        data: coaches.coaches,
        total: coaches.total,
        page: coaches.page,
        limit: coaches.limit,
        message: 'Coaches fetched successfully'
    });
});

// Delete Coach
const deleteCoach = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const coach = await CoachService.getCoachById(id);
    const checkAssignedStudents = coach.assignedStudents.length;

    if (checkAssignedStudents > 0) {
        throw new ErrorHandler(400, 'Cannot delete coach with assigned students');
    }

    const deletedCoach = await CoachService.deleteCoach(id);

    if (!deletedCoach) throw new ErrorHandler(404, 'Coach not found');
    sendResponse(res, 200, null, 'Coach deleted successfully');
});

// Deactivate Coach
const deactivateCoach = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCoach = await CoachService.deactivateCoach(id);
    if (!updatedCoach) throw new ErrorHandler(404, 'Coach not found');
    sendResponse(res, 200, updatedCoach, 'Coach deactivated successfully');
});

// Activate Coach
const activateCoach = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCoach = await CoachService.activateCoach(id);
    if (!updatedCoach) throw new ErrorHandler(404, 'Coach not found');
    sendResponse(res, 200, updatedCoach, 'Coach activated successfully');
});

module.exports = {
    createCoach,
    updateCoach,
    getCoachById,
    getAllCoaches,
    deleteCoach,
    deactivateCoach,
    activateCoach
};
