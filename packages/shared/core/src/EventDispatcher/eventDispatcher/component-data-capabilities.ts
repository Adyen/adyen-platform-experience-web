import type { ExternalComponentType } from '@integration-components/types';
import type { ComponentDataEventCapabilityConfiguration } from './core-events';

export const COMPONENT_DATA_EVENT_CAPABILITIES: Record<ExternalComponentType, ComponentDataEventCapabilityConfiguration> = {
    capitalOffer: {
        callbackProps: ['onContactSupport'],
    },
    capitalOverview: {
        callbackProps: ['onContactSupport'],
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
        callbackProps: ['onContactSupport', 'onShowDetails'],
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
};
