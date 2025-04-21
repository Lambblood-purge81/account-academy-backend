const LectureService = require('../services/lecture-services');
const { ErrorHandler } = require('../utils/error-handler');
const { sendResponse } = require('../helpers/helpers');
const { wrapAsync } = require('../utils/wrapAsync');
const axios = require('axios');
const { vimeoApi } = require('../services/vimeo-service');
const { isEmpty } = require('../utils/utils');

// Add Lecture
const addLecture = wrapAsync(async (req, res) => {
    const lectureData = req.body;

    if (lectureData.file || lectureData.vimeoLink) {
        if (lectureData?.vimeoLink) {
            lectureData.file = '';
            lectureData.vimeoVideoData = null;
        }
        // Pdf File handling
        const newLecture = await LectureService.addLecture(lectureData);
        sendResponse(res, 201, newLecture, 'Lecture Added Successfully');
    } else {
        // Get the video link from Vimeo
        const response = await axios.post(
            `${process.env.VIMEO_BASE_URL}/me/videos`,
            {
                upload: {
                    approach: 'tus',
                    size: req.query.size
                },
                // privacy: {
                //     download: false,
                //     view: 'disable'
                //     // embed: 'whitelist'
                // },
                // embed_domains: ['ropstam.dev', 'ropstam.com', 'localhost'],
                name: req.query.name || 'Untitled Video',
                description: req.query.description || ''
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`
                }
            }
        );

        const newLecture = await LectureService.addLecture(lectureData);
        // Save the video link
        newLecture.vimeoVideoData = response.data;
        await newLecture.save();
        sendResponse(res, 201, newLecture, 'Lecture is ready to upload video...');
    }
});

// Get Lecture by ID
const getLectureById = wrapAsync(async (req, res) => {
    const { id } = req.params;
    // Check lecture from db
    const lecture = await LectureService.getLectureById(id);
    // Get the lecture from Vimeo
    let vimeoVideoData = null;
    if (lecture.vimeoVideoData) {
        vimeoVideoData = await vimeoApi('GET', `${lecture.vimeoVideoData.uri}`, null);
    }

    if (!lecture) throw new ErrorHandler(404, 'Lecture not found');

    // Handle Pdf Lecture
    sendResponse(res, 200, { ...lecture, vimeoVideoData: vimeoVideoData }, 'Lecture fetched successfully');
});

// Update Lecture
const updateLecture = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const lecture = await LectureService.getLectureById(id);
    if (isEmpty(lecture)) throw new ErrorHandler(404, 'Lecture not found');

    // If lecture is a document or via link upload then simply update the lecture
    if (lecture.file || lecture.vimeoLink) {
        if (lecture?.vimeoLink) {
            updateData.file = '';
            updateData.vimeoVideoData = null;
        }
        const updatedLecture = await LectureService.updateLecture(id, updateData);
        sendResponse(res, 200, updatedLecture, 'Lecture updated successfully');
        return;
    } else {
        // delete the previous lecture from Vimeo and upload the new one
        await vimeoApi('DELETE', `${lecture.vimeoVideoData.uri}`, null);

        const response = await axios.post(
            `${process.env.VIMEO_BASE_URL}/me/videos`,
            {
                upload: {
                    approach: 'tus',
                    size: req.query.size
                },
                name: req.query.name || 'Untitled Video',
                description: req.query.description || ''
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`
                }
            }
        );
        // Update the lecture with new video link
        const updatedLecture = await LectureService.updateLecture(id, updateData);

        updatedLecture.vimeoVideoData = response.data;
        await updatedLecture.save();
        sendResponse(res, 200, updatedLecture, 'New lecture is ready to upload...');
    }
});

// Delete Lecture
const deleteLecture = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const lecture = await LectureService.getLectureById(id);
    if (!lecture) throw new ErrorHandler(404, 'Lecture not found');

    if (lecture.file || lecture.vimeoLink) {
        // Delete the lecture directly if it contains the pdf file
        const deletedLecture = await LectureService.deleteLecture(id);
        sendResponse(res, 200, deletedLecture, 'Lecture deleted successfully');
    } else {
        // Delete the video link on Vimeo
        await vimeoApi('DELETE', `${lecture.vimeoVideoData.uri}`, null);

        sendResponse(res, 200, null, 'Lecture deleted successfully');
        // Delete the video on data base
        const deletedLecture = await LectureService.deleteLecture(id);
        sendResponse(res, 200, deletedLecture, 'Lecture deleted successfully');
    }
});

// Get All Lectures
const getAllLectures = wrapAsync(async (req, res) => {
    const { page = 1, limit = 10, ...rest } = req.query;

    const lectures = await LectureService.getAllLectures(rest, page, limit);

    return res.status(200).json({
        data: lectures.lectures,
        total: lectures.total,
        page: lectures.page,
        limit: lectures.limit,
        message: 'Lectures fetched successfully'
    });
});

// Update Lecture to mark as completed by a student
const markLectureAsCompleted = wrapAsync(async (req, res) => {
    const { id: lectureId } = req.params;
    const updatedLecture = await LectureService.markLectureAsCompleted(lectureId, req.user?._id);
    if (!updatedLecture) throw new ErrorHandler(404, 'Lecture not found or student already marked as completed');
    sendResponse(res, 200, updatedLecture, 'Lecture marked as completed');
});

// Student Side

// Perform Quiz
const performQuiz = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const quizData = req.body;
    const updatedLecture = await LectureService.performQuiz(id, quizData, req.user._id);
    sendResponse(res, 200, updatedLecture, 'Quiz submitted successfully');
});

module.exports = {
    addLecture,
    getLectureById,
    updateLecture,
    deleteLecture,
    markLectureAsCompleted,
    // Student
    performQuiz,
    getAllLectures
};
