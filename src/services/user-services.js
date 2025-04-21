const { User } = require('../models/user-model');
const OTP = require('../models/otp-model');

const createUser = async (postData) => await User.create(postData);

const getUserByEmail = async (email, includePassword = false) => {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ email, isDeleted: false }, projection);
};

const getAllUsers = async () => await User.find({ isDeleted: false }, { password: 0 }).lean();

const getNumberOfUsers = async (filter = {}) => await User.countDocuments({ ...filter, isDeleted: false });

const getUser = async (filter, includePassword = false) => {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ ...filter, isDeleted: false }, projection).lean();
};

const updateUserByID = async (id, updateData) => await User.findByIdAndUpdate(id, { ...updateData }, { new: true }).select('-password');

const updateUserByEmail = async (email, updateData) => await User.findOneAndUpdate({ email }, { ...updateData }, { new: true }).lean();

const getUserByID = async (id, includePassword = false) => {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ _id: id, isDeleted: false }, projection);
};

const getOTPByEmail = async (email, otp) => await OTP.findOne({ email, otp });

const dropUserCollection = async () => {
    await User.db.syncIndexes();
    await User.collection.drop();
};

const setCoursesRoadmap = async (studentId, coursesRoadmap) => {
    return await User.findByIdAndUpdate(studentId, { coursesRoadmap }, { new: true });
};

const UserServices = {
    createUser,
    getUserByEmail,
    getAllUsers,
    getNumberOfUsers,
    getUser,
    updateUserByID,
    updateUserByEmail,
    getUserByID,
    getOTPByEmail,
    dropUserCollection,
    setCoursesRoadmap
};

module.exports = UserServices;
