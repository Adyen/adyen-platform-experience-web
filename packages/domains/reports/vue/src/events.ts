import { createDomainEventBridge, type DomainEventCallbacks } from '@integration-components/composables-vue/createDomainEventBridge';

export type ReportsFiltersChangedPayload = Readonly<{
    balanceAccountId?: string;
    createdSince?: string;
    createdUntil?: string;
    reportType?: string;
}>;

export type ReportsContactSupportRequestedPayload = Readonly<{
    component: 'overview';
}>;

export type ReportsOverviewEventMap = Readonly<{
    contactSupportRequested: ReportsContactSupportRequestedPayload;
    filtersChanged: ReportsFiltersChangedPayload;
}>;

export type ReportsOverviewEventCallbacks = DomainEventCallbacks<ReportsOverviewEventMap>;
export type ReportsContactSupportRequestedCallback = NonNullable<ReportsOverviewEventCallbacks['onContactSupportRequested']>;
export type ReportsFiltersChangedCallback = NonNullable<ReportsOverviewEventCallbacks['onFiltersChanged']>;

export type ReportsOverviewEmits = {
    contactSupportRequested: [payload: ReportsContactSupportRequestedPayload];
    filtersChanged: [payload: ReportsFiltersChangedPayload];
};

export const reportsOverviewEventBridge = createDomainEventBridge<ReportsOverviewEventMap>('Reports overview events');
