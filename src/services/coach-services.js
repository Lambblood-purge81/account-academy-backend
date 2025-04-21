const CONSTANT_ENUM = require('../helpers/constant-enums');
const { Coach, User } = require('../models/user-model');
const { ErrorHandler } = require('../utils/error-handler');

const createCoach = async (coachData) => {
    return await Coach.create(coachData);
};

const updateCoach = async (id, updateData) => {
    return await Coach.findByIdAndUpdate(id, updateData, { new: true });
};

const getCoachById = async (id) => {
    return await Coach.findById(id).populate('assignedStudents', 'email role name');
};

const getAllCoaches = async (filters = {}, page = 1, limit = 10) => {
    const coaches = await Coach.find(filters).sort({ createdAt: -1 });

    const total = await Coach.countDocuments(filters);

    return { coaches, total, page, limit };
};

const deleteCoach = async (id) => {
    return await Coach.findByIdAndDelete(id);
};

const deactivateCoach = async (id) => {
    return await Coach.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const activateCoach = async (id) => {
    return await Coach.findByIdAndUpdate(id, { isActive: true }, { new: true });
};

const getUserByEmail = async (email, includePassword = false) => {
    const projection = includePassword ? {} : { password: 0 };
    return await Coach.findOne({ email, isDeleted: false }, projection);
};

// Check if coachData.assignedStudents is an array and is based coachType
// if Coach Type is High Ticket then student should be in array of High Ticket Students coachingTrajectory
// if Coach Type is Low Ticket then student should be in array of Low Ticket Students coachingTrajectory
// The length of assignedStudents array should not be greater than lowTicketStudentSpots or highTicketStudentSpots based on coachType
// these students should not be assigned to any other coach

const checkAssignedStudents = async (coachData) => {
    const studentIds = coachData.assignedStudents;
    const coachType = coachData.coachType;
    const highTicket = CONSTANT_ENUM.COACH.COACH_TYPE.HIGH_TICKET;
    const lowTicket = CONSTANT_ENUM.COACH.COACH_TYPE.LOW_TICKET;

    // check if these students are already assigned to another coach not the same coach
    const isAlreadyAssigned = await User.find({ role: CONSTANT_ENUM.USER_ROLE.COACH, assignedStudents: { $in: studentIds }, _id: { $ne: coachData._id } });

    if (isAlreadyAssigned.length > 0) {
        throw new ErrorHandler(400, 'Some students are already assigned to another coach');
    }

    // Check if the student and coach type are same
    const updatedStudents = await User.find({ role: CONSTANT_ENUM.USER_ROLE.STUDENT, _id: { $in: studentIds } });

    const validTrajectory = updatedStudents.every((student) => (coachType === highTicket ? student.coachingTrajectory === highTicket : student.coachingTrajectory === lowTicket));

    if (!validTrajectory) {
        throw new ErrorHandler(400, `Assigned students should match the coach type (${coachType === highTicket ? 'High Ticket' : 'Low Ticket'})`);
    }

    const maxSpots = coachType === highTicket ? coachData.highTicketStudentSpots : coachData.lowTicketStudentSpots;

    if (studentIds.length > maxSpots) {
        throw new ErrorHandler(400, `Assigned students exceed ${coachType === highTicket ? 'High Ticket Student Spots' : 'LOW Ticket Student Spots'}`);
    }
};

module.exports = {
    createCoach,
    updateCoach,
    getCoachById,
    getAllCoaches,
    deleteCoach,
    deactivateCoach,
    activateCoach,
    getUserByEmail,
    checkAssignedStudents
};
