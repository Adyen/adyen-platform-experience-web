// [TODO]: Export TransactionsListCustomization type from '../../domain/src'
import type { TransactionsListCustomization } from '../../preact/src/TransactionsOverview/types';
import type { TransactionDetailsCustomization /*, TransactionsListCustomization*/ } from '../../domain/src';
import { getCustomDetailsData, getCustomListData } from '../../mocks/mock-data/customData';
import { sleep } from '@integration-components/testing/fixtures/utils';
import { TRANSACTIONS } from '../../mocks/mock-data/transactions';

export const getCustomDataTransactions = () => [
    { ...TRANSACTIONS[0], createdAt: Date.now() },
    { ...TRANSACTIONS[4], createdAt: Date.now() },
    { ...TRANSACTIONS[6], createdAt: Date.now() },
    { ...TRANSACTIONS[8], createdAt: Date.now() },
    { ...TRANSACTIONS[10], createdAt: Date.now() },
];

export const CUSTOM_TRANSLATIONS = {
    _button: 'Action',
    _country: 'Country',
    _product: 'Product',
    _reference: 'Reference',
    _store: 'Store',
    _summary: 'Summary',
};

export const DATA_CUSTOMIZATION_DETAILS: TransactionDetailsCustomization = {
    fields: [
        { key: 'paymentPspReference', visibility: 'hidden' },
        { key: '_store' },
        { key: '_product' },
        { key: '_reference' },
        { key: '_summary' },
        { key: '_button' },
        { key: '_country' },
    ],

    onDataRetrieve: async data => getCustomDetailsData(data?.id),
};

export const DATA_CUSTOMIZATION_LIST: TransactionsListCustomization = {
    fields: [
        { key: '_store', flex: 1.5 },
        { key: '_product' },
        { key: '_reference', flex: 1.5 },
        { key: 'transactionType', visibility: 'hidden' },
        { key: 'amount', flex: 2 },
        { key: '_button', flex: 1.5, align: 'right' },
    ],

    onDataRetrieve: async data => {
        await sleep(200);
        return getCustomListData(data);
    },
};
