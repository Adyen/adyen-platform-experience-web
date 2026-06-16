import type { Meta } from '@storybook/vue3';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { TransactionsOverviewWrapper as TransactionsOverview } from '../../src';
import { http, HttpResponse } from 'msw';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import { TRANSACTIONS } from '../../../mocks/mock-data/transactions';
import { getCustomListData } from '../../../mocks/mock-data/customData';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    ...TransactionsOverviewMeta,
    title: 'Mocked/Transactions/Transactions Overview',
};

export default meta;

const DEFAULT_STORY_ARGS = { mockedApi: true } as const;

export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: DEFAULT_STORY_ARGS,
};

export const SingleBalanceAccount: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance account',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance currency',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<typeof TransactionsOverview> = {
    name: 'Empty list',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - List',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Export',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Balances',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Totals',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const DataCustomization: ElementStory<typeof TransactionsOverview> = {
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
                onDataRetrieve: data => {
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
