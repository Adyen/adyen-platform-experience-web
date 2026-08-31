import type { Meta } from '@storybook/vue3';
import { TransactionsOverviewMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { TransactionsOverviewExternalProps } from '../../src';
import { http, HttpResponse } from 'msw';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import {
    CUSTOM_TRANSLATIONS,
    DATA_CUSTOMIZATION_DETAILS,
    DATA_CUSTOMIZATION_LIST,
    getCustomDataTransactions,
} from '../../../fixtures/data/TransactionsOverview';

const meta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    ...TransactionsOverviewMeta,
    title: 'Mocked/Transactions/Transactions Overview',
};

const sharedArgs = { mockedApi: true } as const;

export const Default: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Default',
    args: sharedArgs,
};

export const SingleBalanceAccount: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance account',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance currency',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Empty list',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - List',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Export',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Balances',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Totals',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const OverviewRoleNotAssigned: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Role not assigned',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.permissionError },
    },
};

export const DataCustomization: ElementStory<TransactionsOverviewExternalProps> = {
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
