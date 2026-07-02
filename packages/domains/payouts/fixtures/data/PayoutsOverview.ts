import type { PayoutDetailsCustomization, PayoutsListCustomization } from '../../domain/src';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers/constants';
import { sleep } from '@integration-components/testing/fixtures/utils';

const customFields = {
    _country: {
        type: 'icon',
        value: '',
        config: {
            src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
        },
    },
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
};

export const CUSTOM_TRANSLATIONS = {
    _country: 'Country',
    _sendEmail: 'Action',
    _summary: 'Summary',
};

export const DATA_CUSTOMIZATION_DETAILS: PayoutDetailsCustomization = {
    // prettier-ignore
    fields: [
        { key: '_summary' },
        { key: '_country' },
        { key: '_sendEmail' },
    ],

    onDataRetrieve: async data => ({ ...data, ...customFields }),
};

export const DATA_CUSTOMIZATION_LIST: PayoutsListCustomization = {
    fields: [
        { key: 'adjustmentAmount', visibility: 'hidden' },
        { key: '_summary' },
        { key: '_country', flex: 0.5 },
        { key: '_sendEmail', align: 'right' },
    ],

    onDataRetrieve: async data => {
        await sleep(200);
        return data.map(payouts => ({ ...payouts, ...customFields }) as const);
    },
};
