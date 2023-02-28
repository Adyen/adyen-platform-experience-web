const { get } = require('request');
const { BCL_API_URL, BALANCE_PLATFORM } = process.env;
const getHeaders = require('../utils/getHeaders');
const handleCallback = require('../utils/handleCallback');

module.exports = (req, res) => {
    const {
        balancePlatform = BALANCE_PLATFORM
    } = req.query;
    const url = new URL(`${BCL_API_URL}/balancePlatforms/${balancePlatform}/accountHolders`);
    const params = {
        url: url.href,
        headers: getHeaders()
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
