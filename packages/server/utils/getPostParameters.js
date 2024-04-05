const { API_KEY } = require('./config');

module.exports = (url, request) => {
    const body = JSON.stringify(request);

    return {
        body,
        url,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body, 'utf8'),
            'X-Api-Key': API_KEY,
        },
    };
};
