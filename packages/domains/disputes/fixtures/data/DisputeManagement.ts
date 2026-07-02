import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import type { DisputeDetailsCustomization } from '../../domain/src';

export const INITIAL_DISPUTE_ID = 'a1b2c3d4-e5f6-4789-abcd-000000000001';

export const CUSTOM_TRANSLATIONS = {
    _country: 'Country',
    _product: 'Product',
    _sendEmail: 'Email',
    _store: 'Store',
    _summary: 'Summary',
};

export const DATA_CUSTOMIZATION: DisputeDetailsCustomization = {
    fields: [
        { key: 'id', visibility: 'hidden' },
        { key: 'createdAt', visibility: 'hidden' },
        { key: 'dueDate', visibility: 'hidden' },
        { key: 'balanceAccount', visibility: 'hidden' },
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
                src: 'https://flagicons.lipis.dev/flags/4x3/es.svg',
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
            value: 'Go to Summary',
            config: {
                href: CUSTOM_URL_EXAMPLE,
            },
        },
    }),
};
