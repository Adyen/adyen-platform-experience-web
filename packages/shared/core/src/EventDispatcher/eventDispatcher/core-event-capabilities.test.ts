import { expect, it } from 'vitest';
import { COMPONENT_DATA_EVENT_CAPABILITIES } from './component-data-capabilities';

it('matches the tracked props declared by each component external props type', () => {
    // Hand-maintained map: any change to an entry must land together with this
    // expectation, so accidental edits cannot pass silently.
    expect(COMPONENT_DATA_EVENT_CAPABILITIES).toEqual({
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
    });
});
