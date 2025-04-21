const Lecture = require('../models/lecture-model');
const Course = require('../models/course-model');

const addLecture = async (lectureData) => {
    const lecture = await Lecture.create(lectureData);
    await Course.findByIdAndUpdate(lectureData.courseId, { $push: { lectures: lecture._id } });
    return lecture;
};

const getLectureById = async (id) => {
    return await Lecture.findById(id).populate('courseId completedBy').lean();
};

const updateLecture = async (id, updateData) => {
    return await Lecture.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteLecture = async (id) => {
    const lecture = await Lecture.findByIdAndDelete(id);
    if (lecture) {
        await Course.findByIdAndUpdate(lecture.courseId, { $pull: { lectures: id } });
    }
    return lecture;
};

const getAllLectures = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const lectures = await Lecture.find(filters).skip(skip).limit(limit);

    const total = await Lecture.countDocuments(filters);

    return { lectures, total, page, limit };
};

const markLectureAsCompleted = async (lectureId, studentId) => {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) throw new Error('Lecture not found');
    if (lecture.completedBy.includes(studentId)) throw new Error('Student already marked as completed');
    lecture.completedBy.push(studentId);
    return await lecture.save();
};

const performQuiz = async (lectureId, quizData, studentId) => {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) throw new Error('Lecture not found');

    let correctAnswersCount = 0;
    const totalQuestions = lecture.quiz.mcqs.length;

    const checkAnswers = (items, answers) => {
        answers.forEach((answer) => {
            const item = items.find((item) => item._id.toString() === answer.questionId.toString());
            if (item) {
                const isCorrect = item.correctAnswer === answer.answer;
                // If student already there then just update the answer
                const studentAnswerIndex = item.studentsAnswers.findIndex((ans) => ans.studentId.toString() === studentId.toString());

                if (studentAnswerIndex !== -1) {
                    // Update the existing answer
                    item.studentsAnswers[studentAnswerIndex].answer = answer.answer;
                    item.studentsAnswers[studentAnswerIndex].result = isCorrect;
                } else {
                    // Add a new answer
                    item.studentsAnswers.push({
                        studentId,
                        answer: answer.answer,
                        result: isCorrect
                    });
                }

                if (isCorrect) correctAnswersCount++;
            }
        });
    };

    await checkAnswers(lecture.quiz.mcqs, quizData.mcqs);

    const pass = (correctAnswersCount / totalQuestions) * 100 >= 50;

    if (pass) {
        // Student passed the quiz, mark lecture as completed
        if (!lecture.completedBy.includes(studentId)) lecture.completedBy.push(studentId);
    } else {
        // Student failed the quiz, remove the student from the completedBy array
        lecture.completedBy = lecture.completedBy.filter((id) => id.toString() !== studentId.toString());
    }

    await lecture.save();

    return { lecture, pass };
};

module.exports = {
    addLecture,
    getLectureById,
    updateLecture,
    deleteLecture,
    markLectureAsCompleted,
    performQuiz,
    getAllLectures
};
