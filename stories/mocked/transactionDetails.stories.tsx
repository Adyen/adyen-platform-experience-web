import { TransactionDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { TransactionDetailsMeta } from '../components/transactionDetails';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'Mocked/Transaction Details' };

export const Basic: ElementStory<typeof TransactionDetails> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

export default meta;
