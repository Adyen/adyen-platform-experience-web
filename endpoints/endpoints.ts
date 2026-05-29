import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL as baseUrl, SETUP_ENDPOINT } from '@integration-components/testing/msw';

export const endpoints = () =>
    ({
        balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
        balances: `${baseUrl}/balanceAccounts/:id/balances`,
        sessions: '/api/authe/api/v1/sessions',
        setup: SETUP_ENDPOINT,
        sendEngageEvent: `${baseUrl}/uxdsclient/engage`,
        sendTrackEvent: `${baseUrl}/uxdsclient/track`,
    }) as const;
