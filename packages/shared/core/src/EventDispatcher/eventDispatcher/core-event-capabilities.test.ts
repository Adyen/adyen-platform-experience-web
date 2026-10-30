import { expect, it } from 'vitest';
import { COMPONENT_DATA_EVENT_CAPABILITIES } from './component-data-capabilities';

it('matches the tracked props declared by each component external props type', () => {
    // Hand-maintained map: any change to an entry must land together with this
    // expectation, so accidental edits cannot pass silently.
    expect(COMPONENT_DATA_EVENT_CAPABILITIES).toEqual({
        capitalOffer: { callbackProps: ['onContactSupport', 'onSubmit'] },
        capitalOverview: { callbackProps: ['onContactSupport'] },
        disputes: {
            callbackProps: ['onContactSupport', 'onRecordSelection'],
            dataCustomization: ['dataGrid', 'details'],
            pagination: true,
        },
        disputesManagement: { callbackProps: ['onContactSupport', 'onAccept', 'onDefend'], dataCustomization: ['details'] },
        paymentLinkCreation: { callbackProps: ['onContactSupport', 'onShowDetails'], fieldsConfig: 'fieldsConfig' },
        paymentLinkDetails: { callbackProps: ['onContactSupport'] },
        paymentLinkSettings: { callbackProps: ['onContactSupport'] },
        paymentLinksOverview: {
            callbackProps: ['onContactSupport', 'onRecordSelection'],
            pagination: true,
        },
        payoutDetails: { callbackProps: ['onContactSupport'], dataCustomization: ['details'] },
        payouts: {
            callbackProps: ['onContactSupport', 'onRecordSelection'],
            dataCustomization: ['dataGrid', 'details'],
            pagination: true,
        },
        reports: { callbackProps: ['onContactSupport'], dataCustomization: ['dataGrid'], pagination: true },
        transactionDetails: { callbackProps: ['onContactSupport'], dataCustomization: ['details'] },
        transactions: {
            callbackProps: ['onContactSupport', 'onRecordSelection'],
            dataCustomization: ['dataGrid', 'details'],
            pagination: true,
        },
    });
});
