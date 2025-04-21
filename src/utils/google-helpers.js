const googleAuth = require('./google-auth');
const UserServices = require('../services/user-services');

const getAccessTokenIfExpired = async (tokens) => {
    if (tokens.expiry_date <= Date.now()) {
        const newTokens = await googleAuth.refreshAccessToken(tokens.refresh_token);
        tokens.access_token = newTokens.access_token;
        tokens.expiry_date = newTokens.expiry_date;

        await UserServices.updateUserByID(tokens.userId, { googleTokens: tokens });
    }
    return tokens;
};

const setGoogleCredentials = async (tokens) => {
    tokens = await getAccessTokenIfExpired(tokens);
    googleAuth.setCredentials({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
};

module.exports = {
    getAccessTokenIfExpired,
    setGoogleCredentials
};
