import { TransactionDetails } from '../../../src';
import { ElementProps, ElementStory } from '../../utils/types';
import { Meta } from '@storybook/preact';
import { TransactionDetailsMeta } from '../../components/transactionDetails';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'Mocked/Transaction Details/Default' };

export const Default: ElementStory<typeof TransactionDetails> = {
    name: 'Default',
    args: {
        id: '1VVF0D5V3709DX6D',
        mockedApi: true,
    },
};

export default meta;
