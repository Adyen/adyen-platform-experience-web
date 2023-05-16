import getHeaders from '../../../utils/getHeaders';
import handleCallback from '../../../utils/handleCallback';
import { request } from 'express';

const { get } = request;

const { BCL_API_URL } = process.env;

const getBalanceAccountById = (req, res) => {
    const endpoint = 'balanceAccounts';
    const url = new URL(`${BCL_API_URL}/${endpoint}/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
export default getBalanceAccountById;
