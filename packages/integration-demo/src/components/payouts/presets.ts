import type { PayoutDetailsCustomization, PayoutsDataGridCustomization } from '@adyen/adyen-platform-experience-web';
import type { Presets } from '../../playground/controls';
import { customButton, customFlag, customLink, getProduct, getStore } from '../../playground/customData';

export const PAYOUTS_DATA_GRID_PRESETS: Presets<PayoutsDataGridCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide adjustmentAmount',
        value: { fields: [{ key: 'adjustmentAmount', visibility: 'hidden' }] },
    },
    custom: {
        label: 'Custom columns (onDataRetrieve)',
        value: {
            fields: [{ key: 'adjustmentAmount', visibility: 'hidden' }, { key: '_summary' }, { key: '_country', flex: 0.6 }, { key: '_action' }],
            onDataRetrieve: async payouts =>
                payouts.map(payout => ({
                    ...payout,
                    _summary: customLink('Summary'),
                    _country: customFlag(payout.createdAt),
                    _action: customButton('Send email', { createdAt: payout.createdAt }),
                })),
        },
    },
};

export const PAYOUT_DETAILS_PRESETS: Presets<PayoutDetailsCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide fundingSource and adjustments',
        value: {
            fields: [
                { key: 'fundingSource', visibility: 'hidden' },
                { key: 'adjustments', visibility: 'hidden' },
            ],
        },
    },
    custom: {
        label: 'Custom fields (onDataRetrieve)',
        value: {
            fields: [{ key: '_store' }, { key: '_product' }, { key: '_country' }, { key: '_summary' }, { key: '_action' }],
            onDataRetrieve: async payout => ({
                ...payout,
                _store: getStore(),
                _product: getProduct(),
                _country: customFlag(),
                _summary: customLink('See summary'),
                _action: customButton('Send email'),
            }),
        },
    },
};
