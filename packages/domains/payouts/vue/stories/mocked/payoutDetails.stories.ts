import type { Meta } from '@storybook/vue3';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayoutDetailsMeta } from '../components/payoutDetails';
import { PayoutDetails } from '../../src';

const getStartOfTodayISOString = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
};

const meta: Meta<ElementProps<typeof PayoutDetails>> = {
    ...PayoutDetailsMeta,
    title: 'Mocked/Payouts/Payout Details',
};

export default meta;

const sharedArgs = {
    date: getStartOfTodayISOString(),
    id: 'BA32272223222B5CTDQPM6W2H',
    balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
    mockedApi: true,
};

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: {
        ...sharedArgs,
    },
};

export const DataCustomization: ElementStory<typeof PayoutDetails> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _summary: 'Summary',
                    _sendEmail: 'Email',
                    _country: 'Country',
                },
            },
        },
        dataCustomization: {
            details: {
                fields: [{ key: '_store' }, { key: '_product' }, { key: '_summary' }, { key: '_sendEmail' }, { key: '_country' }],
                onDataRetrieve: (data: any) => {
                    return new Promise(resolve => {
                        return resolve({
                            ...data,
                            _store: 'Sydney',
                            _product: 'Coffee',
                            _summary: {
                                type: 'link',
                                value: 'See summary',
                                config: {
                                    href: CUSTOM_URL_EXAMPLE,
                                },
                            },
                            _sendEmail: {
                                type: 'button',
                                value: 'Send email',
                                config: {
                                    action: () => console.log('Action'),
                                },
                            },
                            _country: {
                                type: 'icon',
                                value: '',
                                config: {
                                    src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
                                },
                            },
                        });
                    });
                },
            },
        },
    },
};
