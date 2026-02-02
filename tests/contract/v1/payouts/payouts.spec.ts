import { sessionAwareTest } from '../../utils/session-request-function';
import { getRequestURL } from '../../utils/utils';
import { expect } from '@playwright/test';
import { ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';
const ENV = ENVS[environment] || ENVS.test;

sessionAwareTest('/payouts endpoint should return consistent data', async ({ requestContext, headers }) => {
    const payoutsList = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/payouts',
            params: {
                query: { balanceAccountId: ENV.balanceAccountId, createdSince: ENV.createdSince, createdUntil: ENV.createdUntil },
            },
        }),
        { headers }
    );

    const responseData = await payoutsList.json();

    expect(payoutsList.status()).toBe(200);
    expect(responseData).toHaveProperty('data');
    expect(responseData.data).toStrictEqual(ENV.payouts_list_response);
});

sessionAwareTest('/payouts/breakdown endpoint should return consistent data', async ({ requestContext, headers }) => {
    const payoutsDetails = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/payouts/breakdown',
            params: {
                query: { balanceAccountId: ENV.balanceAccountId, createdAt: ENV.payoutCreationDate },
            },
        }),
        { headers }
    );

    const responseData = await payoutsDetails.json();

    expect(payoutsDetails.status()).toBe(200);
    expect(responseData).toHaveProperty('payout');
    expect(responseData).toHaveProperty('amountBreakdowns');
    expect(responseData).toStrictEqual(ENV.payout_details_response);
});
