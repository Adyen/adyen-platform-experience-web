import { expect } from '@playwright/test';
import process from 'node:process';
import { ENVS } from './env_constants';
import dotenv from 'dotenv';
import { sessionAwareTest } from '../utils/session-request-function';
import { getRequestURL } from '../utils/utils';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';

const ENV = ENVS[environment] || ENVS.test;

sessionAwareTest('/transactions endpoint for refunded payment should return consistent data', async ({ requestContext, headers }) => {
    const getTransaction = await requestContext.get(
        getRequestURL({
            method: 'get',
            endpoint: '/transactions/{transactionId}',
            params: {
                path: {
                    transactionId: ENV.transactionId,
                },
            },
            version: 1,
        }),
        { headers }
    );

    expect(getTransaction.status()).toBe(200);

    const responseData = await getTransaction.json();

    expect(responseData).toStrictEqual(ENV.transaction_details_response);
});

sessionAwareTest('/transactions endpoint for refund should return consistent data', async ({ requestContext, headers }) => {
    const getTransaction = await requestContext.get(
        getRequestURL({
            method: 'get',
            endpoint: '/transactions/{transactionId}',
            params: {
                path: {
                    transactionId: ENV.refundTransactionId,
                },
            },
            version: 1,
        }),
        { headers }
    );

    expect(getTransaction.status()).toBe(200);

    const responseData = await getTransaction.json();

    expect(responseData).toStrictEqual(ENV.refund_details_response);
});
