import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { EndpointName } from '../../src/types/api/endpoints';
import { HttpMethod } from '../../src/core/Http/types';
import {
    CapitalComponentManage,
    delay,
    DisputesComponentManage,
    PayByLinkComponentManageLinks,
    PayByLinkComponentManageSettings,
    PayByLinkComponentView,
    PayoutsOverviewComponentView,
    ReportsOverviewComponentView,
    TransactionsOverviewComponentManageRefunds,
    TransactionsOverviewComponentView,
} from '@integration-components/testing/msw';

const networkError = false;
const path = endpoints().setup;

export const setupBasicResponse = {
    endpoints: {
        ...TransactionsOverviewComponentView,
        ...TransactionsOverviewComponentManageRefunds,
        ...ReportsOverviewComponentView,
        ...PayoutsOverviewComponentView,
        ...CapitalComponentManage,
        ...DisputesComponentManage,
        ...PayByLinkComponentView,
        ...PayByLinkComponentManageLinks,
        ...PayByLinkComponentManageSettings,
    } satisfies Record<EndpointName, { method: HttpMethod; url: string; versions: number[] }>,
};

export const setupMock = [
    http.post(path, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
            ...setupBasicResponse,
        });
    }),
];
