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

export const CustomData: ElementStory<typeof TransactionDetails> = {
    name: 'Custom Data',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                },
            },
        },
        mockedApi: true,
        extraDetails: {
            _store: 'Sydney',
            _product: 'Coffee',
        },
    },
};

export default meta;
