import { test, expect, request, APIRequestContext } from '@playwright/test';
import { resolveEnvironment } from '../../../src/core/utils';
import { SESSION, ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });
let token: string;
let apiContext: APIRequestContext;

const environment = process.env.NODE_ENV as 'live' | 'test';

const ENV = ENVS[environment] || ENVS.test;

test.beforeAll(async () => {
    const sessionEndpoint = SESSION.url;
    // Create a new request context
    apiContext = await request.newContext({ timeout: 60000 });
    const normalizedEndpoint = sessionEndpoint?.endsWith('/') ? sessionEndpoint : `${sessionEndpoint}/`;
    const url = `${normalizedEndpoint}authe/api/v1/sessions`;
    const body = {
        allowOrigin: 'https://localhost',
        reference: 'platform-operations',
        product: 'platform',
        policy: {
            resources: [
                {
                    type: 'accountHolder',
                    accountHolderId: SESSION.accountHolder,
                },
            ],
            roles: SESSION.roles,
        },
    };
    const tokenResponse = await apiContext.post(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': SESSION.api_key || '',
        },
        data: body,
    });

    expect(tokenResponse.status()).toBe(200);

    const sessionData = await tokenResponse.json();
    token = sessionData.token;
});

test.describe('Payouts resource', async () => {
    const basePayoutsUrl = `${resolveEnvironment(environment)}v1/payouts`;

    test('/payouts endpoint should return consistent data', async () => {
        apiContext = await request.newContext({ timeout: 60000 });

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
        expect(responseData.data[0]).toStrictEqual(ENV.payouts_list_response);

        await apiContext.dispose();
    });

    test('/payouts/breakdown endpoint should return consistent data', async () => {
        apiContext = await request.newContext({ timeout: 60000 });

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

        await apiContext.dispose();
    });
});
