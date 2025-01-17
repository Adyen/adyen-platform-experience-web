import { Meta } from '@storybook/preact';
import { TransactionDetails } from '../../src';
import { TransactionDetailsMeta } from '../components/transactionDetails';
import { ElementProps, ElementStory } from '../utils/types';

const meta: Meta<ElementProps<typeof TransactionDetails>> = {
    ...TransactionDetailsMeta,
    title: 'Integration/Transaction Details',
};

export const Default: ElementStory<typeof TransactionDetails> = {
    name: 'Default',
    args: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        mockedApi: false,
    },
};

export default meta;
