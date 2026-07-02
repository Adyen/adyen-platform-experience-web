import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers/constants';
import { PAYOUTS_WITH_DETAILS } from '../../mocks/mock-data/payouts';
import type { PayoutDetailsCustomization } from '../../domain/src';

export const DEFAULT_PAYOUT_DETAILS = PAYOUTS_WITH_DETAILS[0]!;

export const CUSTOM_TRANSLATIONS = {
    _country: 'Country',
    _product: 'Product',
    _sendEmail: 'Email',
    _store: 'Store',
    _summary: 'Summary',
};

export const DATA_CUSTOMIZATION: PayoutDetailsCustomization = {
    // prettier-ignore
    fields: [
        { key: '_store' },
        { key: '_product' },
        { key: '_summary' },
        { key: '_sendEmail' },
        { key: '_country' },
    ],

    onDataRetrieve: async data => ({
        ...data,
        _country: {
            type: 'icon',
            value: '',
            config: {
                src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
            },
        },
        _product: 'Coffee',
        _sendEmail: {
            type: 'button',
            value: 'Send email',
            config: {
                action: () => console.log('Action'),
            },
        },
        _store: 'Sydney',
        _summary: {
            type: 'link',
            value: 'See summary',
            config: {
                href: CUSTOM_URL_EXAMPLE,
            },
        },
    }),
};
