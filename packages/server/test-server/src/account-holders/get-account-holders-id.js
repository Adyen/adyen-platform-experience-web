const { BCL_API_URL } = process.env;
import getHeaders from '../../../utils/getHeaders';
import handleCallback from '../../../utils/handleCallback';
import { request } from 'express';

const { get } = request;

const getAccountHoldersById = (req, res) => {
    const endpoint = 'accountHolders';
    const url = new URL(`${BCL_API_URL}/${endpoint}/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};

export default getAccountHoldersById;
