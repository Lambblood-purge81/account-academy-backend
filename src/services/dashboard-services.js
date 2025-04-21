const { User } = require("../models/user-model");
const Course = require("../models/course-model");
const Event = require("../models/event-model");
const { USER_ROLE, COURSE_STATUS } = require("../helpers/constant-enums");
const { getDateRange } = require("../utils/utils");
const DailyFinance = require("../models/dailyFinance-model");
const Product = require("../models/product-model");
const { startOfDay, endOfDay } = require("date-fns");

const getAdminCardData = async () => {
  const spotsAggregation = await User.aggregate([
    { $match: { role: USER_ROLE.COACH } },
    {
      $project: {
        availableHighTicketSpots: {
          $cond: {
            if: { $gt: ["$lowTicketStudentSpots", 0] }, // Check if lowTicketStudentSpots is greater than 0
            then: {
              $subtract: [
                "$highTicketStudentSpots",
                { $size: "$assignedStudents" },
              ],
            }, // Subtract from highTicketStudentSpots
            else: {
              $subtract: [
                "$highTicketStudentSpots",
                { $size: "$assignedStudents" },
              ],
            }, // Otherwise, subtract from highTicketStudentSpots
          },
        },
        availableLowTicketSpots: {
          $cond: {
            if: { $gt: ["$lowTicketStudentSpots", 0] }, // Check if lowTicketStudentSpots is greater than 0
            then: {
              $subtract: [
                "$lowTicketStudentSpots",
                { $size: "$assignedStudents" },
              ],
            }, // Subtract from lowTicketStudentSpots
            else: 0, // Otherwise, no subtraction
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalHighTicketSpots: { $sum: "$availableHighTicketSpots" },
        totalLowTicketSpots: { $sum: "$availableLowTicketSpots" },
      },
    },
  ]);

  const { totalHighTicketSpots, totalLowTicketSpots } = spotsAggregation[0] || {
    totalHighTicketSpots: 0,
    totalLowTicketSpots: 0,
  };
  const totalCourses = await Course.countDocuments({
    isPublished: true,
    status: COURSE_STATUS.PUBLISHED,
  });
  const upcomingSessions = await Event.countDocuments({
    dateTime: { $gte: new Date() },
  });

  return {
    StudentsAvailable: totalLowTicketSpots,
    // StudentsAvailable: totalHighTicketSpots,
    totalCourses,
    upcomingSessions,
    revenue: 0,
  };
};

const getAdminGraphData = async (query) => {
  const { graphFilter = "monthly", date = new Date() } = query;
  const { startDate: graphStartDate, endDate: graphEndDate } = getDateRange(
    graphFilter,
    date
  );

  // Base Aggregation Pipeline
  const baseAggregation = (role) => [
    {
      $match: {
        role: role,
        createdAt: { $gte: graphStartDate, $lte: graphEndDate },
      },
    },
    {
      $group: getGroupingStrategy(graphFilter),
    },
    { $sort: { "_id.weekOfMonth": 1 } },
  ];

  // Aggregated Data
  const totalStudentsData = await User.aggregate(
    baseAggregation(USER_ROLE.STUDENT)
  );
  const totalCoachesData = await User.aggregate(
    baseAggregation(USER_ROLE.COACH)
  );

  return formatGraphData({ totalStudentsData, totalCoachesData }, graphFilter);
};

const getGroupingStrategy = (graphFilter) => {
  switch (graphFilter) {
    case "yearly":
      return {
        _id: { year: { $year: "$createdAt" } },
        count: { $sum: 1 },
      };
    case "daily":
      return {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      };
    case "weekly":
      return {
        _id: {
          weekOfMonth: {
            $floor: {
              $divide: [{ $dayOfMonth: "$createdAt" }, 7], // Calculate week number within the month
            },
          },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      };
    case "monthly":
    default:
      return {
        _id: { month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      };
  }
};

const formatGraphData = (data, graphFilter) => {
  const { totalStudentsData, totalCoachesData } = data;

  const formatMonthly = (rawData) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedData = months.map((month, index) => {
      const dataPoint = rawData.find((item) => item._id.month === index + 1);
      return { [month]: dataPoint ? dataPoint.count : 0 };
    });

    return formattedData;
  };

  const formatYearly = (rawData) => {
    const years = [2020, 2021, 2022, 2023, 2024]; // Fixed range of years

    return years.map((year) => {
      const dataPoint = rawData.find((item) => item._id.year === year);
      return { [year]: dataPoint ? dataPoint.count : 0 };
    });
  };

  const formatDaily = (rawData) => {
    const formattedData = rawData.map((item) => {
      const day = String(item._id.day).padStart(2, "0");
      const month = String(item._id.month).padStart(2, "0");
      return { [`${day}/${month}`]: item.count };
    });

    return formattedData;
  };

  const formatWeekly = (rawData) => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

    const formattedData = weeks.map((week, index) => {
      const dataPoint = rawData.find((item) => item._id.weekOfMonth === index);
      return { [week]: dataPoint ? dataPoint.count : 0 };
    });

    return formattedData;
  };

  switch (graphFilter) {
    case "yearly":
      return {
        totalStudentsData: formatYearly(totalStudentsData),
        totalCoachesData: formatYearly(totalCoachesData),
      };
    case "daily":
      return {
        totalStudentsData: formatDaily(totalStudentsData),
        totalCoachesData: formatDaily(totalCoachesData),
      };
    case "weekly":
      return {
        totalStudentsData: formatWeekly(totalStudentsData),
        totalCoachesData: formatWeekly(totalCoachesData),
      };
    case "monthly":
    default:
      return {
        totalStudentsData: formatMonthly(totalStudentsData),
        totalCoachesData: formatMonthly(totalCoachesData),
      };
  }
};

const getAdminEventsData = async () => {
  const events = await Event.find();
  return events;
};

// Coach

const getCoachCardData = async (coachId) => {
  const coach = await User.findById(coachId);
  const totalStudents = await User.countDocuments({
    role: USER_ROLE.STUDENT,
    assignedCoach: coachId,
  });
  const spotsAvailable =
    coach.highTicketStudentSpots + coach.lowTicketStudentSpots;
  const coachingCallsScheduled = await Event.countDocuments({
    createdBy: coach._id,
  });
  return {
    totalStudents,
    spotsAvailable,
    coachingCallsScheduled,
    totalCoachingInHours: coachingCallsScheduled,
  };
};

const getCoachGraphData = async (coach, query) => {
  const { graphFilter = "yearly", date = new Date() } = query;
  const { startDate: graphStartDate, endDate: graphEndDate } = getDateRange(
    graphFilter,
    date
  );

  const hoursWorkedData = await Event.aggregate([
    {
      $match: {
        createdBy: coach._id,
        dateTime: { $gte: graphStartDate, $lte: graphEndDate },
      },
    },
    {
      $group: getGroupingStrategy(graphFilter),
    },
    { $sort: { "_id.weekOfMonth": 1 } },
  ]);

  const { totalCoachesData } = formatGraphData(
    { totalStudentsData: [], totalCoachesData: hoursWorkedData },
    graphFilter
  );

  return {
    hoursWorkedData: totalCoachesData,
  };
};

const getCoachEventsData = async (coach) => {
  const events = await Event.find({
    createdBy: coach._id,
  });

  return events;
};

// Student
const getStudentCardData = async (studentId) => {
  const testStudents = await DailyFinance.find({ createdBy: studentId });
  console.log({ testStudents }, "------------------------");
  const financeData = await DailyFinance.aggregate([
    { $match: { createdBy: studentId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" },
        profitOrLoss: { $sum: "$profitLoss" },
        totalOrders: { $sum: "$orders" },
      },
    },
  ]);

  const productData = await Product.countDocuments({ createdBy: studentId });

  const { totalRevenue, profitOrLoss, totalOrders } = financeData[0] || {
    totalRevenue: 0,
    profitOrLoss: 0,
    totalOrders: 0,
  };
  const productsTested = productData || 0;

  return {
    myCourses: totalRevenue,
    feedbacks: profitOrLoss,
    totalCourses: productsTested,
    progress: totalOrders,
  };
};

const getStudentCardTwoData = async (studentId) => {
  const financeData = await DailyFinance.aggregate([
    { $match: { createdBy: studentId } },
    {
      $group: {
        _id: null,
        profit: { $sum: "$profitLoss" },
        costs: { $sum: "$adSpend" },
      },
    },
  ]);

  const { profit, costs } = financeData[0] || { profit: 0, costs: 0 };

  return {
    profit,
    costs,
  };
};

const getStudentGraphData = async (studentId, query) => {
  const { graphFilter = "current_month", date = new Date() } = query;
  const { startDate: graphStartDate, endDate: graphEndDate } = getDateRange(
    graphFilter,
    date
  );

  // Revenue Data (Monthly)
  const revenueData = await DailyFinance.aggregate([
    {
      $match: {
        createdBy: studentId,
        date: { $gte: graphStartDate, $lte: graphEndDate },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
        },
        revenue: { $sum: "$revenue" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format Revenue Data
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedRevenueData = months.map((month, index) => {
    const dataPoint = revenueData.find((item) => item._id.month === index + 1);
    return { [month]: dataPoint ? dataPoint.revenue : 0 };
  });

  // Cash Flow Data (Yearly)
  const currentYear = new Date().getFullYear();
  const lastFiveYears = Array.from(
    { length: 5 },
    (_, i) => currentYear - i
  ).reverse();

  const cashFlowData = await DailyFinance.aggregate([
    {
      $match: {
        createdBy: studentId,
        date: {
          $gte: new Date(`${currentYear - 5}-01-01`),
          $lte: graphEndDate,
        },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$date" } },
        cashFlow: { $sum: "$profitLoss" },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  // Format the Cash Flow Data to include the last 5 years, even if no data exists
  const formattedCashFlowData = lastFiveYears.map((year) => {
    const dataPoint = cashFlowData.find((item) => item._id.year === year);
    return { [year]: dataPoint ? dataPoint.cashFlow : 0 };
  });

  return {
    revenueData: formattedRevenueData,
    cashFlowData: formattedCashFlowData,
  };
};

const getStudentEventsData = async (studentId, query) => {
  const { calendarFilter = "month", date = new Date() } = query;
  const { startDate: calendarStartDate, endDate: calendarEndDate } =
    getDateRange(calendarFilter, date);

  // Normalize the dates to start and end of the day to avoid time zone issues
  const normalizedStartDate = startOfDay(calendarStartDate);
  const normalizedEndDate = endOfDay(calendarEndDate);

  const events = await Event.find({
    attendees: studentId,
    dateTime: { $gte: normalizedStartDate, $lte: normalizedEndDate },
  }).select("topic dateTime eventHost");

  return events;
};

module.exports = {
  getAdminCardData,
  getAdminGraphData,
  getAdminEventsData,
  // Coach
  getCoachCardData,
  getCoachGraphData,
  getCoachEventsData,
  // Student
  getStudentCardData,
  getStudentGraphData,
  getStudentEventsData,
  getStudentCardTwoData,
};
