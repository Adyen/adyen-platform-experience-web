export type { DisputeManagementDomainProps, DisputeManagementRenderMode, DisputesDependencies, DisputesOverviewDomainProps } from './integration';

export type { DisputeManagementProps, DisputeDetailsFields, DisputeDetailsCustomization, DisputeCallbackData } from './DisputeManagement';

export type { DisputesOverviewProps, DisputesListCustomization, DisputesTableFields, DisputeStatusGroup } from './DisputesOverview';

export { default as DisputeManagement } from './DisputeManagement/components/DisputeDetailsContainer.vue';
export { default as DisputesOverview } from './DisputesOverview/components/DisputesOverview.vue';
export type {
    DisputeAcceptedCallback,
    DisputeAcceptedPayload,
    DisputeDefendedCallback,
    DisputeDefendedPayload,
    DisputeDismissedCallback,
    DisputeDismissedPayload,
    DisputeManagementEmits,
    DisputeManagementEventCallbacks,
    DisputeManagementEventMap,
    DisputeSelectedCallback,
    DisputeSelectedPayload,
    DisputesContactSupportRequestedCallback,
    DisputesContactSupportRequestedPayload,
    DisputesFiltersChangedCallback,
    DisputesOverviewEmits,
    DisputesOverviewEventCallbacks,
    DisputesOverviewEventMap,
} from './events';
