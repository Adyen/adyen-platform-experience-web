import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import type { HttpMethod } from '../../src/core/Http/types';

const path = endpoints().setup;

const AnalyticsEndpoints = {
    sendEngageEvent: {
        method: 'POST' as HttpMethod,
        url: 'uxdsclient/engage',
        versions: [1],
    },
    sendTrackEvent: {
        method: 'POST' as HttpMethod,
        url: 'uxdsclient/track',
        versions: [1],
    },
};

const ReportsOverviewComponentView = {
    downloadReport: {
        method: 'GET' as HttpMethod,
        url: 'reports/download',
        versions: [1],
    },
    getBalanceAccounts: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts',
        versions: [1],
    },
    getReports: {
        method: 'GET' as HttpMethod,
        url: 'reports',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const setupBasicResponse = {
    endpoints: {
        ...ReportsOverviewComponentView,
    },
};

export const setupMock = [
    http.post(path, async () => {
        await delay(200);
        return HttpResponse.json({
            ...setupBasicResponse,
        });
    }),
];
