import { test as base, APIRequestContext, request } from '@playwright/test';
import process from 'node:process'; // Adjust the import path as needed

type TestFixtures = {
    apiContext: APIRequestContext;
    token: string;
};

const SESSION_ROLES = ['Transactions Overview Component: View', 'Payouts Overview Component: View'];

export const SESSION = {
    accountHolder: process.env.SESSION_ACCOUNT_HOLDER,
    roles: SESSION_ROLES,
    url: process.env.SESSION_API_URL,
    api_key: process.env.API_KEY,
};

export const sessionAwareTest = base.extend<TestFixtures>({
    apiContext: async ({}, use) => {
        const apiContext = await request.newContext({ timeout: 60000 });
        try {
            await use(apiContext);
        } finally {
            await apiContext.dispose();
        }
    },

    token: async ({ apiContext }, use) => {
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

        if (tokenResponse.status() !== 200) {
            throw new Error(`Failed to get token: ${tokenResponse.status()}`);
        }

        const sessionData = await tokenResponse.json();
        const token = sessionData.token;

        await use(token);
    },
});
