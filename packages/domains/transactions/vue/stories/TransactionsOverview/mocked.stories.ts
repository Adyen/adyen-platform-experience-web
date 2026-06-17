import type { Meta } from '@storybook/vue3';
import type { ITransaction } from '@integration-components/types';
import { TransactionsOverviewMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { TransactionsOverviewExternalProps } from '../../src';
import { http, HttpResponse } from 'msw';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import { TRANSACTIONS } from '../../../mocks/mock-data/transactions';
import { getCustomListData } from '../../../mocks/mock-data/customData';

const meta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    ...TransactionsOverviewMeta,
    title: 'Mocked/Transactions/Transactions Overview',
};

const DEFAULT_STORY_ARGS = { mockedApi: true } as const;

export const Default: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Default',
    args: DEFAULT_STORY_ARGS,
};

export const SingleBalanceAccount: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance account',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance currency',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Empty list',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - List',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Export',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Balances',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Totals',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const DataCustomization: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Data customization',
    args: {
        ...DEFAULT_STORY_ARGS,
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _reference: 'Reference',
                    _button: 'Action',
                },
            },
        },
        dataCustomization: {
            list: {
                fields: [
                    { key: '_store', flex: 1.5 },
                    { key: '_product' },
                    { key: '_reference', flex: 1.5 },
                    { key: 'transactionType', visibility: 'hidden' },
                    { key: 'amount', flex: 2 },
                    { key: '_button', flex: 1.5, align: 'right' },
                ],
                onDataRetrieve: (data: ITransaction[]) => {
                    return new Promise(resolve => {
                        setTimeout(() => resolve(getCustomListData(data)), 200);
                    });
                },
            },
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(TRANSACTIONS_ENDPOINTS.transactions, () => {
                    return HttpResponse.json({
                        data: [
                            { ...TRANSACTIONS[0], createdAt: Date.now() },
                            { ...TRANSACTIONS[4], createdAt: Date.now() },
                            { ...TRANSACTIONS[6], createdAt: Date.now() },
                            { ...TRANSACTIONS[8], createdAt: Date.now() },
                            { ...TRANSACTIONS[10], createdAt: Date.now() },
                        ],
                        _links: {},
                    });
                }),
            ],
        },
    },
};

export default meta;
