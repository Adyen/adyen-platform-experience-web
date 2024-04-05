const { post } = require('request');

const defaultUrl = 'https://test.adyen.com/authe/api/v1/sessions';
const defaultApiKey =
    'AQE9hmfxK4vIaxRFw0ixnmU2pOGrRIpZC5xYVStiw2u/vGdHn8l1FfZtByNnAeL1VTYV/zpePy6226uWazGpzhDBXVsNvuR83LVYjEgiTGAH-tcQbmpB+9huP+61xFlYLc9FxPyUoa4MuptTJ+NmMSTY=-C=vC?Qw)JE7PkWe8';

// Active tx
const getUserAccountHolderId = () => 'AH3222Z223226S5KGNXWP4MN9';

// Multicurrency
// const getUserAccountHolderId = () => 'AH3227B2248HKJ5BHTQPKC5GX';

const getUserRoles = () => ['Transactions Overview Component: View', 'Transactions Overview Component – View'];

const getDefaultRequest = () => ({
    allowOrigin: 'http://localhost:3030',
    reference: `reference-${new Date().getTime()}`,
    product: 'platform',
    policy: {
        resources: [
            {
                accountHolderId: getUserAccountHolderId(),
                type: 'accountHolder',
            },
        ],
        roles: getUserRoles(),
    },
});

function httpPost({ apiKey = defaultApiKey, url = defaultUrl, request = getDefaultRequest(), res }) {
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
