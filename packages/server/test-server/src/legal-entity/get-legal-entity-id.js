const { get } = require('request');
const { LEM_API_URL } = process.env;
const getBasicAuthHeaders = require('../../../utils/getBasicAuthHeaders');
const handleCallback = require('../../../utils/handleCallback');

module.exports = (req, res) => {
    const url = new URL(`${LEM_API_URL}/legalEntities/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getBasicAuthHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
