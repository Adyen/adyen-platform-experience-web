import type { ExternalComponentType } from '@integration-components/types';
import type { ComponentDataEventCapabilityConfiguration } from './core-events';

/**
 * Data-event analytics capabilities of every external component, mirroring the
 * tracked props declared by its `...ExternalProps` type in the domain packages:
 * supported callbacks (onContactSupport, onDismiss, onRecordSelection,
 * onShowDetails), data customization, fieldsConfig, pagination and
 * balanceAccountId. Nested configuration props use dotted paths,
 * for example 'paymentLinkCreation.onDismiss'.
 *
 * Hand-maintained: when a `...ExternalProps` type gains or loses a tracked
 * prop, update its entry here in the same change. The
 * `Record<ExternalComponentType, ...>` typing keeps the entries exhaustive —
 * adding an external component type makes the type check demand its entry.
 */
export const COMPONENT_DATA_EVENT_CAPABILITIES: Record<ExternalComponentType, ComponentDataEventCapabilityConfiguration> = {
    capitalOffer: { callbackProps: ['onContactSupport'] },
    capitalOverview: { callbackProps: ['onContactSupport'] },
    disputes: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
        balanceAccountId: true,
    },
    disputesManagement: { callbackProps: ['onContactSupport', 'onDismiss'], dataCustomization: ['details'] },
    paymentLinkCreation: { callbackProps: ['onContactSupport', 'onDismiss', 'onShowDetails'], fieldsConfig: 'fieldsConfig' },
    paymentLinkDetails: { callbackProps: ['onContactSupport', 'onDismiss'] },
    paymentLinkSettings: { callbackProps: ['onContactSupport', 'onDismiss'] },
    paymentLinksOverview: {
        callbackProps: ['onContactSupport', 'onRecordSelection', 'paymentLinkCreation.onDismiss', 'paymentLinkSettings.onDismiss'],
        fieldsConfig: 'paymentLinkCreation.fieldsConfig',
        pagination: true,
        balanceAccountId: true,
    },
    payoutDetails: { callbackProps: ['onContactSupport', 'onDismiss'], dataCustomization: ['details'] },
    payouts: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
        balanceAccountId: true,
    },
    reports: { callbackProps: ['onContactSupport'], dataCustomization: ['dataGrid'], pagination: true, balanceAccountId: true },
    transactionDetails: { callbackProps: ['onContactSupport', 'onDismiss'], dataCustomization: ['details'] },
    transactions: {
        callbackProps: ['onContactSupport', 'onRecordSelection'],
        dataCustomization: ['dataGrid', 'details'],
        pagination: true,
        balanceAccountId: true,
    },
};
