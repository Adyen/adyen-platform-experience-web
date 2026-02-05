import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { getCustomTransactionDataById, getMyCustomData } from './utils/customDataRequest';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../mocks/mock-server/transactions';
import { TRANSACTIONS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsOverviewMeta, title: 'Mocked/Transactions/Transactions Overview' };

export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const SingleBalanceAccount: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<typeof TransactionsOverview> = {
    name: 'Single balance currency',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<typeof TransactionsOverview> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Export',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Balances',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<typeof TransactionsOverview> = {
    name: 'Error - Totals',
    args: { mockedApi: true },
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const DataCustomization: ElementStory<typeof TransactionsOverview> = {
    name: 'Data customization',
    args: {
        mockedApi: true,
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _reference: 'Reference',
                    _button: 'Action',
                    _country: 'Country',
                    _summary: 'Summary',
                },
            },
        },
        dataCustomization: {
            list: {
                fields: [
                    {
                        key: '_store',
                        flex: 1.5,
                    },
                    { key: '_product' },
                    { key: '_reference', flex: 1.5 },
                    { key: 'transactionType', visibility: 'hidden' },
                    { key: 'amount', flex: 2 },
                    { key: '_button', flex: 1.5, align: 'right' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getMyCustomData(data));
                        }, 200);
                    });
                },
            },
            details: {
                fields: [
                    { key: 'paymentPspReference', visibility: 'hidden' },
                    { key: '_store' },
                    { key: '_product' },
                    { key: '_reference' },
                    { key: '_summary' },
                    { key: '_button' },
                    { key: '_country' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        return resolve(getCustomTransactionDataById(data?.id));
                    });
                },
            },
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(endpoints().transactions, () => {
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
