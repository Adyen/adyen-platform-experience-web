import { PayoutDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayoutDetailsMeta } from '../components/payoutDetails';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'Mocked/Payouts/Payout Details' };

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: {
        date: '2024-05-13T10%3A00%3A00.000Z',
        id: 'BA32272223222B5CTDQPM6W2H',
        mockedApi: true,
    },
};

export const DataCustomization: ElementStory<typeof PayoutDetails> = {
    name: 'Data customization',
    args: {
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
        date: '2024-05-13T10%3A00%3A00.000Z',
        id: 'BA32272223222B5CTDQPM6W2H',
        mockedApi: true,
        dataCustomization: {
            details: {
                fields: [{ key: '_store' }, { key: '_product' }, { key: '_summary' }, { key: '_sendEmail' }, { key: '_country' }],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        return resolve({
                            ...data,
                            _store: 'Sydney',
                            _product: 'Coffee',
                            _summary: {
                                type: 'link',
                                value: 'Summary',
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

export default meta;
