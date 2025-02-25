import { TransactionsOverview } from '../../../src';
import { ElementProps, ElementStory } from '../../utils/types';
import { TransactionsMeta } from '../../components/transactionsOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsMeta, title: 'Mocked/Transactions Overview/Default' };
export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
