import { PayoutDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayoutDetailsMeta } from '../components/payoutDetails';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'Mocked/Payout Details' };

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: {
        date: '2024-05-13T10%3A00%3A00.000Z',
        id: 'BA32272223222B5CTDQPM6W2H',
        mockedApi: true,
    },
};

const origin = process.env.VITE_PLAYGROUND_URL;

export const CustomData: ElementStory<typeof PayoutDetails> = {
    name: 'Custom Data',
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
                                details: {
                                    href: `${origin}?path=/story/mocked-reports-overview--custom-columns&summary=${1}`,
                                },
                            },
                            _sendEmail: {
                                type: 'button',
                                value: 'Send email',
                                details: {
                                    action: () => console.log('Action'),
                                },
                            },
                            _country: {
                                type: 'icon',
                                value: '',
                                details: {
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
