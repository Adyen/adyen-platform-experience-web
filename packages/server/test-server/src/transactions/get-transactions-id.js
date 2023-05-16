import getHeaders from '../../../utils/getHeaders';
import handleCallback from '../../../utils/handleCallback';
import { request } from 'express';

const { get } = request;

const { BTL_API_URL } = process.env;

const getTransactions = (req, res) => {
    const endpoint = 'transactions';
    const url = new URL(`${BTL_API_URL}/${endpoint}/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};

export default getTransactions;
