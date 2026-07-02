import { sleep } from '@integration-components/testing/fixtures/utils';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import type { DisputeDetailsCustomization, DisputesListCustomization } from '../../domain/src';

export const CUSTOM_TRANSLATIONS = {
    _country: 'Country',
    _product: 'Product',
    _sendEmail: 'Action',
    _store: 'Store',
    _summary: 'Summary',
};

export const DATA_CUSTOMIZATION_DETAILS: DisputeDetailsCustomization = {
    fields: [
        { key: 'id', visibility: 'hidden' },
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
            value: 'Summary',
            config: {
                href: CUSTOM_URL_EXAMPLE,
            },
        },
    }),
};

export const DATA_CUSTOMIZATION_LIST: DisputesListCustomization = {
    fields: [
        { key: 'disputeReason', visibility: 'hidden' },
        { key: 'reason', visibility: 'hidden' },
        { key: '_summary' },
        { key: '_sendEmail' },
        { key: 'disputedAmount', align: 'left' },
    ],

    onDataRetrieve: async data => {
        await sleep(200);
        return data.map(dispute => ({
            ...dispute,
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
        }));
    },
};
