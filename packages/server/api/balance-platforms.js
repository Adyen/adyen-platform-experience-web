const { get } = require('request');
const { BCL_API_URL } = process.env;
const getHeaders = require('../utils/getHeaders');
const handleCallback = require('../utils/handleCallback');

module.exports = (req, res) => {
    const url = new URL(`${BCL_API_URL}/balancePlatforms/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getHeaders()
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
