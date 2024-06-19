import { test, expect, request, APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import { resolveEnvironment } from '../../src/core/utils';
import * as process from 'node:process';

const SESSION_ROLES = ['Transactions Overview Component: View', 'Payouts Overview Component: View'];

dotenv.config({ path: './envs/.env' });

let token: string;
let apiContext: APIRequestContext;

test.beforeAll(async () => {
    const sessionEndpoint = process.env.SESSION_API_URL;
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
                    accountHolderId: process.env.SESSION_ACCOUNT_HOLDER,
                },
            ],
            roles: SESSION_ROLES,
        },
    };
    const tokenResponse = await apiContext.post(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.API_KEY || '',
        },
        data: body,
    });

    expect(tokenResponse.status()).toBe(200);

    // Parse the token response JSON
    const sessionData = await tokenResponse.json();
    token = sessionData.token; // Adjust according to actual response structure
});

test.describe('Payouts resource', async () => {
    // const basePayoutsUrl = `${resolveEnvironment('live')}v1/payouts`;
    const basePayoutsUrl = `${resolveEnvironment('test')}v1/payouts`;

    test('/payouts endpoint should return consistent data', async () => {
        apiContext = await request.newContext({ timeout: 60000 });
        /*
        const LIVE_BALANCE_ACCOUNT = 'BA322VJ223226S5KGB6H492CL';
        const LIVE_CREATED_SINCE = '2024-05-14T00:00:00.000Z';
        const LIVE_CREATED_UNTIL = '2024-06-19T00:00:00.000Z';
        */

        const LIVE_BALANCE_ACCOUNT = 'BA3222Z223226S5KGFZ3LBFWP';
        const LIVE_CREATED_SINCE = '2024-04-16T00:00:00.000Z';
        const LIVE_CREATED_UNTIL = '2024-06-19T00:00:00.000Z';

        const payoutsList = await apiContext.get(
            `${basePayoutsUrl}?balanceAccountId=${LIVE_BALANCE_ACCOUNT}&createdSince=${LIVE_CREATED_SINCE}&createdUntil=${LIVE_CREATED_UNTIL}`,
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

        /*
        const RESPONSE = {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'USD',
            },
            payoutAmount: {
                value: 47,
                currency: 'USD',
            },
            unpaidAmount: {
                value: -47,
                currency: 'USD',
            },
            createdAt: '2024-05-14T11:40:13.000+00:00',
        };
    */

        const RESPONSE = {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 1000,
                currency: 'USD',
            },
            payoutAmount: {
                value: 1000,
                currency: 'USD',
            },
            unpaidAmount: {
                value: 0,
                currency: 'USD',
            },
            createdAt: '2024-05-27T15:15:05.000+00:00',
        };

        expect(responseData).toHaveProperty('data');
        expect(responseData.data[0]).toStrictEqual(RESPONSE);

        // Close the request context
        await apiContext.dispose();
    });

    test('/payouts/breakdown endpoint should return consistent data', async () => {
        apiContext = await request.newContext({ timeout: 60000 });

        /*
        const LIVE_BALANCE_ACCOUNT = 'BA322VJ223226S5KGB6H492CL';
        const LIVE_CREATED_SINCE = '2024-05-14T00:00:00.000Z';
        const LIVE_CREATED_UNTIL = '2024-06-19T00:00:00.000Z';
        */

        const LIVE_BALANCE_ACCOUNT = 'BA3222Z223226S5KGFZ3LBFWP';
        const LIVE_CREATED_SINCE = '2024-05-27T00:00:00.000Z';

        const payoutsList = await apiContext.get(
            `${basePayoutsUrl}/breakdown?balanceAccountId=${LIVE_BALANCE_ACCOUNT}&createdAt=${LIVE_CREATED_SINCE}`,
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

        /*
        const RESPONSE = {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'USD',
            },
            payoutAmount: {
                value: 47,
                currency: 'USD',
            },
            unpaidAmount: {
                value: -47,
                currency: 'USD',
            },
            createdAt: '2024-05-14T11:40:13.000+00:00',
        };
    */

        const RESPONSE = {
            payout: {
                fundsCapturedAmount: {
                    value: 0,
                    currency: 'USD',
                },
                adjustmentAmount: {
                    value: 1000,
                    currency: 'USD',
                },
                payoutAmount: {
                    value: 1000,
                    currency: 'USD',
                },
                unpaidAmount: {
                    value: 0,
                    currency: 'USD',
                },
                createdAt: '2024-05-27T15:15:05.000+00:00',
            },
            amountBreakdowns: {
                fundsCapturedBreakdown: [],
                adjustmentBreakdown: [
                    {
                        amount: {
                            value: 1000,
                            currency: 'USD',
                        },
                        category: 'transfer',
                    },
                ],
            },
        };

        expect(responseData).toHaveProperty('payout');
        expect(responseData).toHaveProperty('amountBreakdowns');
        expect(responseData).toStrictEqual(RESPONSE);

        // Close the request context
        await apiContext.dispose();
    });
});
