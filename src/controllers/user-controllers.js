const config = require("../config/config");
const MAIL_HANDLER = require("../mails/mails");
const OTP = require("../models/otp-model");
const UserServices = require("../services/user-services");
const { ErrorHandler } = require("../utils/error-handler");
const { randomNumberGenerate, isEmpty } = require("../utils/utils");
const { wrapAsync } = require("../utils/wrapAsync");
const jwt = require("jsonwebtoken");
const generateToken = require("../helpers/generate-token");
const CONSTANT_ENUM = require("../helpers/constant-enums");

// Helper function to send response
const sendResponse = (res, data, message = "Operation successful") => {
  res.status(200).json({ data, message });
};

// Login with email
const loginWithEmail = wrapAsync(async (req, res) => {
  const { email, password } = res.locals.jsonReq;

  const user = await UserServices.getUserByEmail(email, true);

  if (isEmpty(user)) throw new ErrorHandler(404, "User account not found");

  if (!user.isActive)
    throw new ErrorHandler(
      403,
      "Your account has been deactivated, please contact support"
    );

  if (!(await user.matchPassword(password)))
    throw new ErrorHandler(400, "Incorrect email or password");

  const token = generateToken(user._id, user.role, "72h");
  const userWithoutPassword = await UserServices.getUserByID(user._id);
  sendResponse(
    res,
    { user: userWithoutPassword, token },
    "User logged in successfully"
  );
});

// Send OTP on email
const sendOtpOnEmail = wrapAsync(async (req, res) => {
  const { email } = res.locals.jsonReq;
  const otp = randomNumberGenerate(5);

  const user = await UserServices.getUserByEmail(email, true);

  if (isEmpty(user)) throw new ErrorHandler(404, "User account not found");

  await OTP.deleteMany({ email });
  await OTP.create({ otp, email });

  MAIL_HANDLER.sendEmailToUserWithOTP(user, otp);

  sendResponse(res, {}, "OTP has been sent to your email");
});

// Verify OTP
const verifyOTP = wrapAsync(async (req, res) => {
  const { email, otp } = res.locals.jsonReq;

  const otpValid = await UserServices.getOTPByEmail(email, otp);
  if (!otpValid)
    throw new ErrorHandler(401, "OTP could not be verified, please try again");

  const user = await UserServices.getUserByEmail(email, true);
  await UserServices.updateUserByID(user._id, { isVerified: true });
  const token = generateToken(user._id, user.role, "72h");

  await OTP.deleteOne({ _id: otpValid._id });

  const userWithoutPassword = await UserServices.getUserByID(user._id);
  sendResponse(
    res,
    { user: userWithoutPassword, token },
    "User account verified successfully"
  );
});

// Update email password
const updateEmailPassword = wrapAsync(async (req, res) => {
  const { password } = res.locals.jsonReq;
  const { user } = req;

  const updatedUser = await UserServices.updateUserByID(user._id, { password });
  if (!updatedUser) throw new ErrorHandler(404, "User does not exist");

  const userWithoutPassword = await UserServices.getUserByID(user._id);
  sendResponse(res, userWithoutPassword, "Password updated successfully");
});
// Update profile and/or password
const updateProfile = wrapAsync(async (req, res) => {
  const { currentPassword, newPassword, ...profileData } = res.locals.jsonReq;
  const { user } = req;

  const userWithoutPassword = await UserServices.getUserByID(user._id);
  if (!userWithoutPassword) throw new ErrorHandler(404, "User not found");

  let updatedUser = {};

  // Update profile information if provided
  if (Object.keys(profileData).length > 0) {
    updatedUser = await UserServices.updateUserByID(user._id, profileData);
  }

  // Update password if provided
  if (currentPassword && newPassword) {
    const userWithPassword = await UserServices.getUserByID(user._id, true);
    if (!(await userWithPassword.matchPassword(currentPassword))) {
      throw new ErrorHandler(400, "Current password is incorrect");
    }
    updatedUser = await UserServices.updateUserByID(user._id, {
      password: newPassword,
    });
  }

  sendResponse(res, updatedUser, "User profile updated successfully");
});

// Get user profile
const getProfile = wrapAsync(async (req, res) => {
  const { user } = req;
  const userWithoutPassword = await UserServices.getUserByID(user._id);
  sendResponse(res, userWithoutPassword, "User found successfully");
});

// Delete my account
const deleteMyAccount = wrapAsync(async (req, res) => {
  const { status } = res.locals.jsonReq;
  const { user } = req;

  const updatedUser = await UserServices.updateUserByID(user._id, {
    isDeleted: status,
    deleteDate: new Date(),
  });

  const userWithoutPassword = await UserServices.getUserByID(updatedUser._id);
  sendResponse(
    res,
    userWithoutPassword,
    "Your account has been deleted successfully"
  );
});

// Admin Routes
const getAllUsers = wrapAsync(async (req, res) => {
  const users = await UserServices.getAllUsers();
  sendResponse(res, users, "Users found successfully");
});

const getUser = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const user = await UserServices.getUserByID(id);
  sendResponse(res, user, "User found successfully");
});

const deleteUser = wrapAsync(async (req, res) => {
  const { status } = res.locals.jsonReq;
  const { id } = req.params;

  const updatedUser = await UserServices.updateUserByID(id, {
    isDeleted: status,
    deleteDate: new Date(),
  });

  const userWithoutPassword = await UserServices.getUserByID(updatedUser._id);
  sendResponse(res, userWithoutPassword, "User account deleted successfully");
});

const dropUserCollection = wrapAsync(async (req, res) => {
  const result = await UserServices.dropUserCollection();
  sendResponse(res, result, "Collection dropped successfully");
});

const getUserFromToken = wrapAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) throw new ErrorHandler(404, "Token not found");

  const decoded = jwt.verify(token, config.server.jwtSecretKey);
  let user = await UserServices.getUserByID(decoded.id, true);

  if (!user) throw new ErrorHandler(404, "User not found");

  user = await UserServices.updateUserByID(user._id, { lastVisit: new Date() });
  const userWithoutPassword = await UserServices.getUserByID(user._id);
  sendResponse(res, userWithoutPassword, "Token Verified");
});

const setCoursesRoadmap = wrapAsync(async (req, res) => {
  const { studentId } = req.params;
  const { coursesRoadmap } = req.body;
  const updatedStudent = await UserServices.setCoursesRoadmap(
    studentId,
    coursesRoadmap
  );
  if (!updatedStudent) throw new ErrorHandler(404, "Student not found");
  sendResponse(res, 200, updatedStudent, "Courses roadmap set successfully");
});

const createDefaultAdmin = async () => {
  try {
    console.log("===================== Working =======================");
    const isAdminExist = await UserServices.getNumberOfUsers({
      role: CONSTANT_ENUM.USER_ROLE.ADMIN,
    });
    console.log({ isAdminExist });

    if (isAdminExist === 0) {
      await UserServices.createUser({
        name: "John doe",
        email: config.server.email,
        password: config.server.password,
        role: CONSTANT_ENUM.USER_ROLE.ADMIN,
        isVerified: true,
        lastVisit: new Date(),
        phoneNumber: 111111,
        region: "UK",
        country: "England",
      });
    }
  } catch (error) {
    console.log({ error });
  }
};

module.exports = {
  sendOtpOnEmail,
  verifyOTP,
  updateEmailPassword,
  loginWithEmail,
  updateProfile,
  getAllUsers,
  getUser,
  deleteUser,
  dropUserCollection,
  getUserFromToken,
  getProfile,
  deleteMyAccount,
  setCoursesRoadmap,
  createDefaultAdmin,
};
