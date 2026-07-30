import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { http, HttpResponse } from 'msw';
import { TransactionsOverviewMeta } from './meta';
import { Meta } from '@storybook/preact';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import {
    CUSTOM_TRANSLATIONS,
    DATA_CUSTOMIZATION_DETAILS,
    DATA_CUSTOMIZATION_LIST,
    getCustomDataTransactions,
} from '../../../fixtures/data/TransactionsOverview';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsOverviewMeta, title: 'Mocked/Transactions/Transactions Overview' };
const sharedArgs = { mockedApi: true } as const;

export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: sharedArgs,
};

export const SingleBalanceAccount: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance account',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance currency',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<typeof TransactionsOverview> = {
    name: 'Empty list',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - List',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Export',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Balances',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Totals',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const DataCustomization: ElementStory<typeof TransactionsOverview> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: {
            details: DATA_CUSTOMIZATION_DETAILS,
            list: DATA_CUSTOMIZATION_LIST,
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(TRANSACTIONS_ENDPOINTS.transactions, () => {
                    return HttpResponse.json({ data: getCustomDataTransactions(), _links: {} });
                }),
            ],
        },
    },
};

export default meta;
