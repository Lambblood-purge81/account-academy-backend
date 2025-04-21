const axios = require('axios');

const Vimeo = require('vimeo').Vimeo;

const client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_ACCESS_TOKEN);

const uploadVideo = (filePath, videoData) => {
    return new Promise((resolve, reject) => {
        client.upload(
            filePath,
            {
                name: videoData.name,
                description: videoData.description,
                privacy: { view: 'anybody' }
            },
            (uri) => resolve(uri),
            (bytes_uploaded, bytes_total) => {
                const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
                console.log(`${percentage}% uploaded`);
            },
            (error) => reject(error)
        );
    });
};

const deleteVideo = (uri) => {
    return new Promise((resolve, reject) => {
        client.request({ method: 'DELETE', path: uri }, (error, body) => {
            if (error) reject(error);
            resolve(body);
        });
    });
};

const getVideo = (uri) => {
    return new Promise((resolve, reject) => {
        client.request({ method: 'GET', path: uri }, (error, body) => {
            if (error) reject(error);
            resolve(body);
        });
    });
};

const updateVideo = (uri, videoData) => {
    return new Promise((resolve, reject) => {
        client.request(
            {
                method: 'PATCH',
                path: uri,
                query: videoData
            },
            (error, body) => {
                if (error) reject(error);
                resolve(body);
            }
        );
    });
};

const vimeoApi = async (method, path, data) => {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const config = {
        method,
        url: `${process.env.VIMEO_BASE_URL}${path}`,
        ...axiosConfig
    };

    config.headers['Authorization'] = `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`;

    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
};

module.exports = {
    uploadVideo,
    deleteVideo,
    getVideo,
    updateVideo,
    vimeoApi
};
