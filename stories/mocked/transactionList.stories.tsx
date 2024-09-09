import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsMeta } from '../components/transactionList';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { getMyCustomData } from './utils/customDataRequest';
import { TRANSACTIONS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsMeta, title: 'Mocked/Transactions List' };
export const Basic: ElementStory<typeof TransactionsOverview> = {
    name: 'Basic',
    args: {
        mockedApi: true,
    },
};
export const Empty: ElementStory<typeof TransactionsOverview> = {
    name: 'Empty list',
    args: {
        mockedApi: true,
    },
};

Empty.parameters = {
    msw: {
        handlers: [
            http.get(endpoints('mock').transactions, () => {
                return HttpResponse.json({
                    data: [],
                    _links: {},
                });
            }),
        ],
    },
};

export const CustomColumns: ElementStory<typeof TransactionsOverview> = {
    name: 'Custom Columns',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                },
            },
        },
        mockedApi: true,
        columns: [
            { key: '_store', flex: 1.5 },
            { key: '_product' },
            { key: 'paymentMethod' },
            { key: 'transactionType' },
            { key: 'createdAt' },
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
        msw: {
            handlers: [
                http.get(endpoints('mock').transactions, () => {
                    return HttpResponse.json({
                        data: [
                            { ...TRANSACTIONS[0], createdAt: Date.now() },
                            { ...TRANSACTIONS[4], createdAt: Date.now() },
                            { ...TRANSACTIONS[6], createdAt: Date.now() },
                        ],
                        _links: {},
                    });
                }),
            ],
        },
    },
};

export default meta;
