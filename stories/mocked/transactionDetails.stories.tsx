import { TransactionDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { TransactionDetailsMeta } from '../components/transactionDetails';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'Mocked/Transaction Details' };

export const Default: ElementStory<typeof TransactionDetails> = {
    name: 'Default',
    args: {
        id: '1VVF0D5V3709DX6D',
        mockedApi: true,
    },
};

const origin = process.env.VITE_PLAYGROUND_URL;

export const CustomData: ElementStory<typeof TransactionDetails> = {
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
        id: '1VVF0D5V3709DX6D',
        mockedApi: true,
        extraDetails: {
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
        },
    },
};

export default meta;
