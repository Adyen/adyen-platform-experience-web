import { test as base, APIRequestContext, request } from '@playwright/test';
import { resolveEnvironment } from '../../../src/core/utils';
import { getHeaders } from './utils';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';
const SESSION_ROLES = ['Transactions Overview Component: View', 'Payouts Overview Component: View', 'Reports Overview Component: View'];

export const SESSION = {
    accountHolder: process.env.SESSION_ACCOUNT_HOLDER,
    roles: SESSION_ROLES,
    url: process.env.SESSION_API_URL,
    api_key: process.env.API_KEY,
};

type TestFixtures = {
    requestContext: APIRequestContext;
    token: string;
    accountHolder: any;
    headers: { [key: string]: string } | undefined;
};

export const sessionAwareTest = base.extend<TestFixtures>({
    requestContext: async ({}, use) => {
        const apiContext = await request.newContext({
            timeout: 60000,
            ignoreHTTPSErrors: true,
            baseURL: `${resolveEnvironment(environment).apiUrl}`,
        });
        try {
            await use(apiContext);
        } finally {
            await apiContext.dispose();
        }
    },
    accountHolder: [SESSION.accountHolder, { option: true }],
    token: async ({ accountHolder }, use) => {
        const sessionEndpoint = SESSION.url;
        const normalizedEndpoint = sessionEndpoint?.endsWith('/') ? sessionEndpoint : `${sessionEndpoint}/`;
        const apiContext = await request.newContext({ timeout: 60000, ignoreHTTPSErrors: true, baseURL: normalizedEndpoint });

        const body = {
            allowOrigin: 'https://localhost',
            reference: 'platform-operations',
            product: 'platform',
            policy: {
                resources: [
                    {
                        type: 'accountHolder',
                        accountHolderId: accountHolder,
                    },
                ],
                roles: SESSION.roles,
            },
        };
        const tokenResponse = await apiContext.post('/authe/api/v1/sessions', {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SESSION.api_key || '',
            },
            data: body,
            ignoreHTTPSErrors: true,
        });

        if (tokenResponse.status() !== 200) {
            throw new Error(`Failed to get token: ${tokenResponse.status()}`);
        }

        const sessionData = await tokenResponse.json();
        const token = sessionData.token;
        await use(token);
    },
    headers: async ({ token }, use) => {
        const headers = { ...getHeaders({ token }).headers };
        await use(headers);
    },
});
