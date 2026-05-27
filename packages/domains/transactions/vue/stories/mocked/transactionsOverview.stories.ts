import type { Meta } from '@storybook/vue3';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { TransactionsOverviewWrapper as TransactionsOverview } from '../../src';
import { http, HttpResponse } from 'msw';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import { TRANSACTIONS } from '../../../mocks/mock-data/transactions';
import type { ITransaction } from '@integration-components/types';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    ...TransactionsOverviewMeta,
    title: 'Mocked/Transactions/Transactions Overview',
};

export default meta;

const DEFAULT_STORY_ARGS = { mockedApi: true } as const;

const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const stores = [
    { value: 'New York', flag: 'us' },
    { value: 'Chicago', flag: 'us' },
    { value: 'San Francisco', flag: 'us' },
    { value: 'Madrid', flag: 'es' },
    { value: 'Singapore', flag: 'sg' },
    { value: 'Amsterdam', flag: 'nl' },
    { value: 'London', flag: 'gb' },
    { value: 'Sydney', flag: 'au' },
    { value: 'Melbourne', flag: 'au' },
    { value: 'Toronto', flag: 'ca' },
] as const;

const getIndex = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    return Number(numericId[numericId.length - 1]);
};

const getCustomData = async (data: ITransaction[]) =>
    data.map(tx => {
        const idx = getIndex(tx.id);
        const store = stores[idx]!;
        return {
            ...tx,
            _store: { value: store.value, type: 'icon', config: { src: `https://flagicons.lipis.dev/flags/4x3/${store.flag}.svg` } } as const,
            _product: { value: products[idx], type: 'text' } as const,
            _reference: { type: 'link', value: tx.id, config: { value: '', href: CUSTOM_URL_EXAMPLE } } as const,
            _button: { type: 'button', value: 'Refund', config: { action: () => console.log('Action') } } as const,
        };
    });

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
                        setTimeout(() => resolve(getCustomData(data)), 200);
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
