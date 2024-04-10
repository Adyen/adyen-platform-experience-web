const { post } = require('request');
const { ACCOUNT_HOLDER } = process.env;

const getUserAccountHolderId = () => ACCOUNT_HOLDER;

const getUserRoles = () => ['Transactions Overview Component: View', 'Transactions Overview Component – View'];

function httpPost({ apiKey, url, request, res }) {
    const body = JSON.stringify(request);

    const params = {
        body,
        url,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body, 'utf8'),
            'X-Api-Key': apiKey,
        },
    };

    post(params, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.send(error);
        }

        if (response.statusCode && response.statusMessage) {
            console.log(`Request to ${res.req.url} ended with status ${response.statusCode} - ${response.statusMessage}`);
        }

        res.send(body);
    });
}

module.exports = {
    getUserAccountHolderId,
    httpPost,
    getUserRoles,
};
