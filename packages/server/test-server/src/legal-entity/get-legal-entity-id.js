import getBasicAuthHeaders from '../../../utils/getBasicAuthHeaders';
import handleCallback from '../../../utils/handleCallback';

import { request } from 'express';

const { get } = request;

const { LEM_API_URL } = process.env;

const getLegalEntityId = (req, res) => {
    const url = new URL(`${LEM_API_URL}/legalEntities/${req.params.id}`);
    const params = {
        url: url.href,
        headers: getBasicAuthHeaders(),
    };

    get(params, (error, response, body) => handleCallback({ error, response, body }, res));
};

export default getLegalEntityId;
