import { TransactionsInsights } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { TransactionsInsightsMeta } from '../components/transactionsInsights';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../mocks/mock-server/transactions';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsInsights>> = { ...TransactionsInsightsMeta, title: 'Mocked/Transactions/Transactions Insights' };

export const Default: ElementStory<typeof TransactionsInsights> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const SingleBalanceAccount: ElementStory<typeof TransactionsInsights> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<typeof TransactionsInsights> = {
    name: 'Single balance currency',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const ErrorTotals: ElementStory<typeof TransactionsInsights> = {
    name: 'Error - Totals',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export default meta;
