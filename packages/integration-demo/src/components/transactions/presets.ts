import type { TransactionDetailsCustomization, TransactionsDataGridCustomization } from '@adyen/adyen-platform-experience-web';
import type { Presets } from '../../playground/controls';
import { customButton, customFlag, customLink, getProduct, getStore } from '../../playground/customData';

export const TRANSACTIONS_DATA_GRID_PRESETS: Presets<TransactionsDataGridCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide paymentMethod and transactionType',
        value: {
            fields: [
                { key: 'paymentMethod', visibility: 'hidden' },
                { key: 'transactionType', visibility: 'hidden' },
            ],
        },
    },
    custom: {
        label: 'Custom columns (onDataRetrieve)',
        value: {
            fields: [
                { key: 'transactionType', visibility: 'hidden' },
                { key: '_store', flex: 1.5 },
                { key: '_country', flex: 0.6 },
                { key: '_action' },
            ],
            onDataRetrieve: async transactions =>
                transactions.map(transaction => ({
                    ...transaction,
                    _store: getStore(transaction.id),
                    _country: customFlag(transaction.id),
                    _action: customButton('Notify', { id: transaction.id }),
                })),
        },
    },
};

export const TRANSACTION_DETAILS_PRESETS: Presets<TransactionDetailsCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide description and paymentPspReference',
        value: {
            fields: [
                { key: 'description', visibility: 'hidden' },
                { key: 'paymentPspReference', visibility: 'hidden' },
            ],
        },
    },
    custom: {
        label: 'Custom fields (onDataRetrieve)',
        value: {
            fields: [{ key: '_store' }, { key: '_product' }, { key: '_country' }, { key: '_summary' }, { key: '_action' }],
            onDataRetrieve: async transaction => ({
                ...transaction,
                _store: getStore(transaction.id),
                _product: getProduct(transaction.id),
                _country: customFlag(transaction.id),
                _summary: customLink('See summary'),
                _action: customButton('Notify', { id: transaction.id }),
            }),
        },
    },
};
