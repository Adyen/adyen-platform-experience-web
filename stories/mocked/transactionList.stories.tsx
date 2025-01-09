import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsMeta } from '../components/transactionList';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { getMyCustomData } from './utils/customDataRequest';
import { TRANSACTIONS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsMeta, title: 'Mocked/Transactions Overview' };
export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

const CUSTOM_COLUMNS_MOCK_HANDLER = {
    handlers: [
        http.get(endpoints('mock').transactions, () => {
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
};
export const CustomColumns: ElementStory<typeof TransactionsOverview> = {
    name: 'Custom Columns',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _reference: 'Reference',
                },
            },
        },
        mockedApi: true,
        columns: [
            {
                key: '_store',
                flex: 1.5,
            },
            { key: '_product' },
            { key: 'paymentMethod' },
            { key: 'createdAt' },
            { key: '_reference' },
            { key: 'amount', flex: 1.5 },
        ],
        onDataRetrieved: data => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getMyCustomData(data));
                }, 200);
            });
        },
    },
    parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },
};

export const CustomOrder: ElementStory<typeof TransactionsOverview> = {
    name: 'Custom order',
    args: {
        mockedApi: true,
        columns: ['transactionType', 'paymentMethod', 'createdAt', 'amount'],
    },
    parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },
};

export default meta;
