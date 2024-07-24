import { expect } from '@playwright/test';
import { resolveEnvironment } from '../../../src/core/utils';
import { ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';
import { sessionAwareTest } from '../utils/session-request-function';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';

const ENV = ENVS[environment] || ENVS.test;

const basePayoutsUrl = `${resolveEnvironment(environment)}v1/payouts`;

sessionAwareTest('/payouts endpoint should return consistent data', async ({ apiContext, token }) => {
    const payoutsList = await apiContext.get(
        `${basePayoutsUrl}?balanceAccountId=${ENV.balanceAccountId}&createdSince=${ENV.createdSince}&createdUntil=${ENV.createdUntil}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Origin: 'https://localhost',
            },
        }
    );

    expect(payoutsList.status()).toBe(200);

    const responseData = await payoutsList.json();

    expect(responseData).toHaveProperty('data');
    expect(responseData.data[0]).toStrictEqual(ENV.payouts_list_response[0]);
});

sessionAwareTest('/payouts/breakdown endpoint should return consistent data', async ({ apiContext, token }) => {
    const payoutsDetails = await apiContext.get(
        `${basePayoutsUrl}/breakdown?balanceAccountId=${ENV.balanceAccountId}&createdAt=${ENV.payoutCreationDate}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Origin: 'https://localhost',
            },
        }
    );

    expect(payoutsDetails.status()).toBe(200);

    const responseData = await payoutsDetails.json();

    expect(responseData).toHaveProperty('payout');
    expect(responseData).toHaveProperty('amountBreakdowns');
    expect(responseData).toStrictEqual(ENV.payout_details_response);
});
