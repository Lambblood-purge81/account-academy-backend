const CONSTANT_ENUM = require("../helpers/constant-enums");
const Course = require("../models/course-model");
const { Coach, Student } = require("../models/user-model");

const createCourse = async (courseData) => {
  return await Course.create(courseData);
};

const updateCourse = async (id, updateData) => {
  return await Course.findByIdAndUpdate(id, updateData, { new: true }).populate(
    {
      path: "moduleManager",
      select: "name email role",
    }
  );
};

const getCourseById = async (id, user) => {
  const projection =
    user.role === CONSTANT_ENUM.USER_ROLE.STUDENT
      ? {
          select:
            "-quiz.questions.correctAnswer -quiz.mcqs.correctAnswer -quiz.questions.studentsAnswers -quiz.mcqs.studentsAnswers",
        }
      : "";
  return await Course.findById(id)
    .populate({
      path: "lectures",
      select: projection?.select,
    })
    .populate({
      path: "enrolledStudents",
      select: "name email role",
    })
    .populate({
      path: "moduleManager",
      select: "name email role",
    });
};

const getAllCourses = async (filters = {}, page = 1, limit = 10) => {
  const queryFilters = { isPublished: true, ...filters };
  if (filters.search) {
    queryFilters.title = { $regex: filters.search, $options: "i" };
  }

  // Student Create Module fetch only courses of similar coachType
  if (filters.coachType) {
    const moduleManagers = await Coach.find(
      { coachType: filters.coachType },
      "_id"
    );
    const moduleManagerIds = moduleManagers.map((manager) => manager._id);
    queryFilters.moduleManager = { $in: moduleManagerIds };
  }
  // New Filter For Active and non-active courses | Archive or in archive (Admin | Coach)
  if (filters.isActive) {
    if (filters.isActive === "Inactive Courses") {
      queryFilters.isArchived = false;
    } else if (filters.isActive === "Active Courses") {
      queryFilters.isArchived = true;
    } else {
      delete filters.isActive;
    }
  }

  // Student Edit Module fetch only courses of assigned coach (moduleManager)
  if (filters.studentId) {
    const student = await Student.findById(filters.studentId);
    // Also check if this student is present to enrolledStudents
    queryFilters.moduleManager = student.assignedCoach;
  }

  const skip = (page - 1) * limit;
  const courses = await Course.find(queryFilters)
    .skip(skip)
    .limit(limit)
    .populate("lectures")
    .populate("moduleManager", "name coachType")
    .sort({ createdAt: -1 });

  const total = await Course.countDocuments(queryFilters);
  return { courses, total, page, limit };
};

const getAllCoursesOnStudentDashboard = async (
  filters = {},
  page = 1,
  limit = 10,
  user = null
) => {
  const queryFilters = { isPublished: true, ...filters };

  // Search
  if (filters.search) {
    queryFilters.title = { $regex: filters.search, $options: "i" };
  }

  let courses = await Course.find(queryFilters)
    .populate({
      path: "lectures",
      populate: {
        path: "completedBy",
      },
    })
    .populate("moduleManager")
    .skip((page - 1) * limit)
    .limit(limit);

  // Split the courses into two arrays: enrolled and not enrolled
  const enrolledCourses = courses.filter((course) =>
    course.enrolledStudents.includes(user._id)
  );
  const notEnrolledCourses = courses.filter(
    (course) => !course.enrolledStudents.includes(user._id)
  );

  // Sort enrolled courses based on the student's coursesRoadmap
  const sortedEnrolledCourses = enrolledCourses.sort((a, b) => {
    return (
      user.coursesRoadmap.indexOf(a._id.toString()) -
      user.coursesRoadmap.indexOf(b._id.toString())
    );
  });

  // Combine sorted enrolled courses with not enrolled courses at the end
  courses = [...sortedEnrolledCourses, ...notEnrolledCourses];

  const total = await Course.countDocuments(queryFilters);

  return { courses, total, page, limit };
};

const getEnrolledCourses = async (filters = {}, page = 1, limit = 10, user) => {
  if (!user?.coursesRoadmap || user.coursesRoadmap.length === 0) {
    return { courses: [], total: 0, page, limit };
  }

  // Create a query object for published courses that the student is enrolled in
  const query = {
    _id: { $in: user.coursesRoadmap },
    isPublished: true,
    enrolledStudents: user?._id,
  };

  if (filters.search) {
    // Add search filter to the query
    query.title = { $regex: filters.search, $options: "i" };
  }

  // Find all courses that match the query
  let courses = await Course.find(query)
    .populate({
      path: "lectures",
      populate: {
        path: "completedBy",
      },
    })
    .populate("moduleManager")
    .skip((page - 1) * limit)
    .limit(limit);

  // Sort the courses based on the order in the student's coursesRoadmap
  courses = courses.sort((a, b) => {
    return (
      user.coursesRoadmap.indexOf(a._id.toString()) -
      user.coursesRoadmap.indexOf(b._id.toString())
    );
  });

  const total = await Course.countDocuments(query);

  return { courses, total, page, limit };
};

const deleteCourse = async (id) => {
  return await Course.findByIdAndDelete(id);
};

const archiveCourse = async (id) => {
  return await Course.findByIdAndUpdate(
    id,
    { isArchived: true },
    { new: true }
  );
};

const unarchiveCourse = async (id) => {
  return await Course.findByIdAndUpdate(
    id,
    { isArchived: false },
    { new: true }
  );
};

const getAllStudentsInCourse = async (courseId) => {
  return await Course.findById(courseId).populate("lectures enrolledStudents");
};
const getStudentProgress = async (courseId, studentId) => {
  const course = await Course.findById(courseId).populate("lectures");
  if (!course) throw new Error("Course not found");

  const student = await Student.findById(studentId).select("name avatar ");

  const totalLectures = course.lectures.length;
  let completedLectures = 0;
  let totalQuestions = 0;
  let answeredQuestions = 0;

  const lectures = course.lectures.map((lecture) => {
    const isCompleted = lecture.completedBy.includes(studentId);
    if (isCompleted) {
      completedLectures += 1;
    }
    lecture.quiz.mcqs.forEach((question) => {
      totalQuestions += 1;
      if (
        question.studentsAnswers.some(
          (answer) => answer.studentId.toString() === studentId
        )
      ) {
        answeredQuestions += 1;
      }
    });

    return {
      lectureId: lecture._id,
      lectureTitle: lecture.name,
      isCompleted,
    };
  });

  return {
    totalLectures,
    completedLectures,
    totalQuestions,
    answeredQuestions,
    lectureCompletionPercentage: (completedLectures / totalLectures) * 100,
    quizCompletionPercentage: (answeredQuestions / totalQuestions) * 100,
    lectures,
    student,
    course: {
      title: course.title,
      subtitle: course.subtitle,
    },
  };
};

const getCoursePreviewById = async (id) => {
  return await Course.findById(id)
    .populate("lectures")
    .populate("moduleManager", "name")
    .exec();
};

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
  getCoursePreviewById,
  getAllCoursesOnStudentDashboard,
};
