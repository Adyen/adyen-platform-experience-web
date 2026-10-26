import type { HttpMethod } from '@integration-components/core';
import type { EndpointName } from '@integration-components/types/api/endpoints';
import {
    capitalComponentManage,
    disputesComponentManage,
    payByLinkComponentManageLinks,
    payByLinkComponentManageSettings,
    payByLinkComponentView,
    payoutsOverviewComponentView,
    reportsOverviewComponentView,
    transactionsOverviewComponentManageRefunds,
    transactionsOverviewComponentView,
} from '../msw/rolesToEndpointsMapping';

export const setupBasicResponse = {
    endpoints: {
        ...transactionsOverviewComponentView,
        ...transactionsOverviewComponentManageRefunds,
        ...reportsOverviewComponentView,
        ...payoutsOverviewComponentView,
        ...capitalComponentManage,
        ...disputesComponentManage,
        ...payByLinkComponentView,
        ...payByLinkComponentManageLinks,
        ...payByLinkComponentManageSettings,
    } satisfies Record<EndpointName, { method: HttpMethod; url: string; versions: number[] }>,
};
