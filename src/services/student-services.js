const { Student } = require('../models/user-model');

const createStudent = async (studentData) => {
    return await Student.create(studentData);
};

const updateStudent = async (id, updateData) => {
    return await Student.findByIdAndUpdate(id, updateData, { new: true });
};

const getStudentById = async (id) => {
    return await Student.findById(id).populate('createdBy', 'email role').populate('coursesRoadmap', 'title');
};

const getAllStudents = async (filters = {}, page = 1, limit = 10) => {
    if ((filters.coachingTrajectory && filters.coachingTrajectory === 'All') || filters.coachingTrajectory === 'all') {
        delete filters.coachingTrajectory;
    }

    const students = await Student.find({ ...filters })
        .populate('createdBy', 'email role')
        .populate({
            path: 'coursesRoadmap',
            select: 'title lectures',
            populate: {
                path: 'lectures',
                select: 'name completedBy'
            }
        })
        .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filters);

    return { students, total, page, limit };
};

const getStudentsHaveNoCoach = async (filters = {}, page = 1, limit = 10) => {
    const students = await Student.find({ ...filters, isActive: true })
        .populate('createdBy', 'email role')
        .populate({
            path: 'coursesRoadmap',
            select: 'title lectures',
            populate: {
                path: 'lectures',
                select: 'name completedBy'
            }
        })
        .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filters);
    return { students, total, page, limit };
};
const deleteStudent = async (id) => {
    return await Student.findByIdAndDelete(id);
};

const deactivateStudent = async (id) => {
    return await Student.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const activateStudent = async (id) => {
    return await Student.findByIdAndUpdate(id, { isActive: true }, { new: true });
};

const unassignStudentFromCoach = async (coachId, studentId) => {
    return await Student.updateOne(
        {
            _id: studentId,
            assignedCoach: coachId
        },
        { $unset: { assignedCoach: '' } }
    );
};

module.exports = {
    createStudent,
    updateStudent,
    getStudentById,
    getAllStudents,
    deleteStudent,
    deactivateStudent,
    activateStudent,
    getStudentsHaveNoCoach,
    unassignStudentFromCoach
};
