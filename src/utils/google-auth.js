const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

const getAuthUrl = () => {
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
};

const getAccessToken = async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    return tokens;
};

const setCredentials = (tokens) => {
    oAuth2Client.setCredentials(tokens);
};

const refreshAccessToken = async (refreshToken) => {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const newTokens = await oAuth2Client.getAccessToken();
    return newTokens.token;
};

const getOAuth2Client = () => oAuth2Client;

module.exports = {
    getAuthUrl,
    getAccessToken,
    setCredentials,
    refreshAccessToken,
    getOAuth2Client
};
