import type { DataOverviewActionKeys, DataOverviewErrorKeys, ErrorMessageKeys } from '@integration-components/composables-vue';
import type { TransactionsTranslationKey } from '@integration-components/transactions/domain';

/**
 * Transactions catalog keys supplied to the portable data-overview error helpers. Domain-local
 * translation names are opaque to portable code, so the shared helpers receive the
 * transactions-scoped keys explicitly instead of a cross-domain namespace.
 */
export const TRANSACTIONS_ERROR_MESSAGE_KEYS: ErrorMessageKeys<TransactionsTranslationKey> = {
    contactSupport: 'transactions.errors.contactSupport',
    errorCode: 'transactions.errors.errorCode',
    errorCodeSupport: 'transactions.errors.errorCodeSupport',
    notFound: 'transactions.errors.notFound',
    requestInvalid: 'transactions.errors.requestInvalid',
    retry: 'transactions.errors.retry',
    somethingWentWrong: 'transactions.errors.somethingWentWrong',
    unexpected: 'transactions.errors.unexpected',
};

export const TRANSACTIONS_DATA_OVERVIEW_ERROR_KEYS: DataOverviewErrorKeys<TransactionsTranslationKey> = {
    accountInvalid: 'transactions.errors.accountInvalid',
    accountUnavailable: 'transactions.errors.accountUnavailable',
};

export const TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS: DataOverviewActionKeys<TransactionsTranslationKey> = {
    contactSupport: 'transactions.actions.contactSupport.labels.reachOut',
    copyDone: 'transactions.actions.copy.labels.done',
    copyErrorCode: 'transactions.actions.copy.labels.errorCode',
    refresh: 'transactions.actions.refresh.labels.default',
};
