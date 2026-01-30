import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { EndpointName } from '../../src/types/api/endpoints';
import { HttpMethod } from '../../src/core/Http/types';
import {
    CapitalComponentManage,
    DisputesComponentManage,
    PayByLinkComponentManageLinks,
    PayByLinkComponentManageSettings,
    PayByLinkComponentView,
    PayoutsOverviewComponentView,
    ReportsOverviewComponentView,
    TransactionsOverviewComponentManageRefunds,
    TransactionsOverviewComponentView,
} from './utils/rolesToEndpointsMapping';

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
