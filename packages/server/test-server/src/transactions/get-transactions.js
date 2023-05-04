const { get } = require('request');
const { BALANCE_PLATFORM, BTL_API_URL } = process.env;
const getHeaders = require('../../../utils/getHeaders');
const handleCallback = require('../../../utils/handleCallback');
const LIMIT = 20;

const test = (req, res) => {
    const endpoint = 'transactions';
    const {
        createdSince = '2022-05-30T15:07:40Z',
        createdUntil = new Date().toISOString(),
        balancePlatform = BALANCE_PLATFORM,
        accountHolderId,
        balanceAccountId,
        cursor,
    } = req.query;

    const searchParams = new URLSearchParams({
        limit: LIMIT,
        ...(createdSince && { createdSince }),
        ...(createdUntil && { createdUntil }),
        ...(balancePlatform && { balancePlatform }),
        ...(accountHolderId && { accountHolderId }),
        ...(balanceAccountId && { balanceAccountId }),
        ...(cursor && { cursor }),
    });

    const url = new URL(`${BTL_API_URL}/${endpoint}?${searchParams.toString()}`);
    const params = {
        url: url.href,
        headers: getHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};

module.exports = test;
