import { test as base, APIRequestContext, request } from '@playwright/test';
import process from 'node:process';
import { getHeaders } from './utils';

const SESSION_ROLES = ['Transactions Overview Component: View', 'Payouts Overview Component: View'];

export const SESSION = {
    accountHolder: process.env.SESSION_ACCOUNT_HOLDER,
    roles: SESSION_ROLES,
    url: process.env.SESSION_API_URL,
    api_key: process.env.API_KEY,
};

type TestFixtures = {
    apiContext: APIRequestContext;
    token: string;
    accountHolder: any;
    headers: { [key: string]: string } | undefined;
};

export const sessionAwareTest = base.extend<TestFixtures>({
    apiContext: async ({}, use) => {
        const apiContext = await request.newContext({ timeout: 60000, ignoreHTTPSErrors: true });
        try {
            await use(apiContext);
        } finally {
            await apiContext.dispose();
        }
    },
    accountHolder: [SESSION.accountHolder, { option: true }],
    token: async ({ apiContext, accountHolder }, use) => {
        const sessionEndpoint = SESSION.url;
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
                        accountHolderId: accountHolder,
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

        if (tokenResponse.status() !== 200) {
            throw new Error(`Failed to get token: ${tokenResponse.status()}`);
        }

        const sessionData = await tokenResponse.json();
        const token = sessionData.token;

        await use(token);
    },

    headers: async ({ token }, use) => {
        const headers = {
            ...getHeaders({ token }).headers,
        };
        await use(headers);
    },
});
