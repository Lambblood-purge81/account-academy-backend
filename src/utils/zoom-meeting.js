const axios = require('axios');

const getZoomAccessToken = async (user) => {
    const clientId = user.clientId;
    const clientSecret = user.clientSecret;
    const accountId = user.accountId;

    try {
        const response = await axios.post(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, null, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Zoom access token', error);
        throw new Error('Failed to retrieve Zoom access token');
    }
};

const getNearestOccurrenceId = (dateTime, occurrences) => {
    // Convert the target dateTime to a Date object
    const targetTime = new Date(dateTime).getTime();

    // Initialize variables to store the closest occurrence and minimum difference
    let nearestOccurrence = null;
    let minDifference = Infinity;

    // Iterate over each occurrence
    occurrences.forEach((occurrence) => {
        // Check the occurrence status, skip if deleted or unavailable
        if (occurrence.status !== 'available') return;

        // Convert the occurrence's start_time to a Date object
        const occurrenceTime = new Date(occurrence.start_time).getTime();

        // Calculate the absolute difference between targetTime and occurrenceTime
        const timeDifference = Math.abs(targetTime - occurrenceTime);

        // If this is the smallest difference, update the nearest occurrence
        if (timeDifference < minDifference) {
            minDifference = timeDifference;
            nearestOccurrence = occurrence;
        }
    });

    // Return the occurrence_id of the nearest occurrence or null if not found
    return nearestOccurrence ? nearestOccurrence.occurrence_id : null;
};

module.exports = {
    getZoomAccessToken,
    getNearestOccurrenceId
};
