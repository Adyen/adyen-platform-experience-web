import type { TransactionDetailsCustomization } from '../../domain/src';
import type { ITransactionWithDetails } from '@integration-components/types';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';

export const CUSTOM_TRANSLATIONS = {
    _country: 'Country',
    _product: 'Product',
    _sendEmail: 'Email',
    _store: 'Store',
    _summary: 'Summary link',
};

export const DATA_CUSTOMIZATION: TransactionDetailsCustomization = {
    fields: [
        { key: 'description', visibility: 'hidden' },
        { key: 'id', visibility: 'hidden' },
        { key: '_store' },
        { key: '_product' },
        { key: '_summary' },
        { key: '_sendEmail' },
        { key: '_country' },
    ],

    onDataRetrieve: async (data: ITransactionWithDetails) => ({
        ...data,
        _country: {
            type: 'icon',
            value: '',
            config: { src: 'https://flagicons.lipis.dev/flags/4x3/es.svg' },
        },
        _product: 'Coffee',
        _sendEmail: {
            type: 'button',
            value: 'Send email',
            config: { action: () => console.log('Action') },
        },
        _store: 'Sydney',
        _summary: {
            type: 'link',
            value: 'See summary',
            config: { href: CUSTOM_URL_EXAMPLE },
        },
    }),
};
