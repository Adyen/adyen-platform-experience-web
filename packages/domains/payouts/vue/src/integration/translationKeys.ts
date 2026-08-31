import type { DataOverviewActionKeys, DataOverviewErrorKeys, ErrorMessageKeys } from '@integration-components/composables-vue';
import type { PayoutsTranslationKey } from '@integration-components/payouts/domain';

/**
 * Payouts catalog keys supplied to the portable data-overview error helpers. Domain-local
 * translation names are opaque to portable code, so the shared helpers receive the
 * payouts-scoped keys explicitly instead of a cross-domain namespace.
 */
export const PAYOUTS_ERROR_MESSAGE_KEYS: ErrorMessageKeys<PayoutsTranslationKey> = {
    contactSupport: 'payouts.errors.contactSupport',
    errorCode: 'payouts.errors.errorCode',
    errorCodeSupport: 'payouts.errors.errorCodeSupport',
    notFound: 'payouts.errors.notFound',
    requestInvalid: 'payouts.errors.requestInvalid',
    retry: 'payouts.errors.retry',
    somethingWentWrong: 'payouts.errors.somethingWentWrong',
    unexpected: 'payouts.errors.unexpected',
};

export const PAYOUTS_DATA_OVERVIEW_ERROR_KEYS: DataOverviewErrorKeys<PayoutsTranslationKey> = {
    accountInvalid: 'payouts.errors.accountInvalid',
    accountUnavailable: 'payouts.errors.accountUnavailable',
};

export const PAYOUTS_DATA_OVERVIEW_ACTION_KEYS: DataOverviewActionKeys<PayoutsTranslationKey> = {
    contactSupport: 'payouts.actions.contactSupport.labels.reachOut',
    copyDone: 'payouts.actions.copy.labels.done',
    copyErrorCode: 'payouts.actions.copy.labels.errorCode',
    refresh: 'payouts.actions.refresh.labels.default',
};
