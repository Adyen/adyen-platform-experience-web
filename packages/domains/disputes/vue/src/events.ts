import { createDomainEventBridge, type DomainEventCallbacks } from '@integration-components/composables-vue/createDomainEventBridge';
import type { DisputeCallbackData, DisputesOverviewFilters } from '../../domain/src';

export type DisputeSelectedPayload = Readonly<{
    id: string;
    showModal(): void;
}>;

export type DisputesContactSupportRequestedPayload = Readonly<{
    component: 'management' | 'overview';
    disputeId?: string;
}>;

export type DisputeDismissedPayload = Readonly<{ id: string }>;
export type DisputeAcceptedPayload = Readonly<DisputeCallbackData>;
export type DisputeDefendedPayload = Readonly<DisputeCallbackData>;

export type DisputesOverviewEventMap = Readonly<{
    contactSupportRequested: DisputesContactSupportRequestedPayload;
    disputeAccepted: DisputeAcceptedPayload;
    disputeDefended: DisputeDefendedPayload;
    disputeDismissed: DisputeDismissedPayload;
    disputeSelected: DisputeSelectedPayload;
    filtersChanged: DisputesOverviewFilters;
}>;

export type DisputeManagementEventMap = Readonly<{
    contactSupportRequested: DisputesContactSupportRequestedPayload;
    disputeAccepted: DisputeAcceptedPayload;
    disputeDefended: DisputeDefendedPayload;
    dismissed: DisputeDismissedPayload;
}>;

export type DisputesOverviewEventCallbacks = DomainEventCallbacks<DisputesOverviewEventMap>;
export type DisputeManagementEventCallbacks = DomainEventCallbacks<DisputeManagementEventMap>;

export type DisputeSelectedCallback = NonNullable<DisputesOverviewEventCallbacks['onDisputeSelected']>;
export type DisputesFiltersChangedCallback = NonNullable<DisputesOverviewEventCallbacks['onFiltersChanged']>;
export type DisputesContactSupportRequestedCallback = NonNullable<DisputesOverviewEventCallbacks['onContactSupportRequested']>;
export type DisputeAcceptedCallback = NonNullable<DisputeManagementEventCallbacks['onDisputeAccepted']>;
export type DisputeDefendedCallback = NonNullable<DisputeManagementEventCallbacks['onDisputeDefended']>;
export type DisputeDismissedCallback = NonNullable<DisputeManagementEventCallbacks['onDismissed']>;

export type DisputesOverviewEmits = {
    contactSupportRequested: [payload: DisputesContactSupportRequestedPayload];
    disputeAccepted: [payload: DisputeAcceptedPayload];
    disputeDefended: [payload: DisputeDefendedPayload];
    disputeDismissed: [payload: DisputeDismissedPayload];
    disputeSelected: [payload: DisputeSelectedPayload];
    filtersChanged: [payload: DisputesOverviewFilters];
};

export type DisputeManagementEmits = {
    contactSupportRequested: [payload: DisputesContactSupportRequestedPayload];
    disputeAccepted: [payload: DisputeAcceptedPayload];
    disputeDefended: [payload: DisputeDefendedPayload];
    dismissed: [payload: DisputeDismissedPayload];
};

export const disputesOverviewEventBridge = createDomainEventBridge<DisputesOverviewEventMap>('Disputes overview events');
export const disputeManagementEventBridge = createDomainEventBridge<DisputeManagementEventMap>('Dispute management events');
