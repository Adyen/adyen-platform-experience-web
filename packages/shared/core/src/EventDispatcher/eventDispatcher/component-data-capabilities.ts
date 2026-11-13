import type { ExternalComponentType } from '@integration-components/types';
import type { ComponentDataEventCapabilityConfiguration } from './core-events';

export const COMPONENT_DATA_EVENT_CAPABILITIES = {
    capitalOffer: {
        callbackProps: ['onContactSupport', 'onSubmit'],
    },
    capitalOverview: {
        callbackProps: ['onContactSupport'],
    },
    cashOutOverview: {
        callbackProps: ['onContactSupport', 'onSubmit'],
    },
    // The standalone CashOut Request doesn't offer contact support.
    cashOutRequest: {
        callbackProps: ['onSubmit'],
    },
    disputes: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
    },
    disputesManagement: {
        callbackProps: ['onContactSupport', 'onAccept', 'onDefend'],
        dataCustomization: ['details'],
    },
    paymentLinkCreation: {
        callbackProps: ['onContactSupport', 'onCreate'],
        fieldsConfig: 'fieldsConfig',
    },
    paymentLinkDetails: {
        callbackProps: ['onContactSupport'],
    },
    paymentLinkSettings: {
        callbackProps: ['onContactSupport'],
    },
    paymentLinksOverview: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        pagination: true,
    },
    payoutDetails: {
        callbackProps: ['onContactSupport'],
        dataCustomization: ['details'],
    },
    payouts: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
    },
    reports: {
        callbackProps: ['onContactSupport'],
        dataCustomization: ['dataGrid'],
        pagination: true,
    },
    transactionDetails: {
        callbackProps: ['onContactSupport'],
        dataCustomization: ['details'],
    },
    transactions: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
    },
} as const satisfies Record<ExternalComponentType, ComponentDataEventCapabilityConfiguration>;
