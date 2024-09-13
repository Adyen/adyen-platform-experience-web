import { TransactionDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { TransactionDetailsMeta } from '../components/transactionDetails';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'Mocked/Transaction Details' };

export const Basic: ElementStory<typeof TransactionDetails> = {
    name: 'Basic',
    args: {
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
