const { get } = require('request');
const { BTL_API_URL } = process.env;
const getHeaders = require('../../../utils/getHeaders');
const handleCallback = require('../../../utils/handleCallback');

module.exports = (req, res) => {
    const endpoint = 'transactions';
    const url = new URL(`${BTL_API_URL}/${endpoint}/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
