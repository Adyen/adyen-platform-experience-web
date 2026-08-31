import { createDomainEventBridge, type DomainEventCallbacks } from '@integration-components/composables-vue/createDomainEventBridge';

export type PayoutsFiltersChangedPayload = Readonly<{
    balanceAccountId?: string;
    createdSince?: string;
    createdUntil?: string;
}>;

export type PayoutSelectedPayload = Readonly<{
    balanceAccountId: string;
    date: string;
    showModal(): void;
}>;

export type PayoutsContactSupportRequestedPayload = Readonly<{
    component: 'details' | 'overview';
}>;

export type PayoutsOverviewEventMap = Readonly<{
    contactSupportRequested: PayoutsContactSupportRequestedPayload;
    filtersChanged: PayoutsFiltersChangedPayload;
    payoutSelected: PayoutSelectedPayload;
}>;

export type PayoutDetailsEventMap = Readonly<{
    contactSupportRequested: PayoutsContactSupportRequestedPayload;
}>;

export type PayoutsOverviewEventCallbacks = DomainEventCallbacks<PayoutsOverviewEventMap>;
export type PayoutDetailsEventCallbacks = DomainEventCallbacks<PayoutDetailsEventMap>;

export type PayoutsFiltersChangedCallback = NonNullable<PayoutsOverviewEventCallbacks['onFiltersChanged']>;
export type PayoutSelectedCallback = NonNullable<PayoutsOverviewEventCallbacks['onPayoutSelected']>;
export type PayoutsContactSupportRequestedCallback = NonNullable<PayoutsOverviewEventCallbacks['onContactSupportRequested']>;

export type PayoutsOverviewEmits = {
    contactSupportRequested: [payload: PayoutsContactSupportRequestedPayload];
    filtersChanged: [payload: PayoutsFiltersChangedPayload];
    payoutSelected: [payload: PayoutSelectedPayload];
};

export type PayoutDetailsEmits = {
    contactSupportRequested: [payload: PayoutsContactSupportRequestedPayload];
};

export const payoutsOverviewEventBridge = createDomainEventBridge<PayoutsOverviewEventMap>('Payouts overview events');
export const payoutDetailsEventBridge = createDomainEventBridge<PayoutDetailsEventMap>('Payout details events');
