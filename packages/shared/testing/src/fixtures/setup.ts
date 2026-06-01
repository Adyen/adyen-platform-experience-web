import type { HttpMethod } from '@integration-components/core';
import type { EndpointName } from '@integration-components/types/api/endpoints';
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
} from '../msw/rolesToEndpointsMapping';

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
