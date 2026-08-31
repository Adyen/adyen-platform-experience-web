import type { DataOverviewActionKeys, DataOverviewErrorKeys, ErrorMessageKeys } from '@integration-components/composables-vue';
import type { DisputesTranslationKey } from '@integration-components/disputes/domain';

/**
 * Disputes catalog keys supplied to the portable data-overview error helpers. Domain-local
 * translation names are opaque to portable code, so the shared helpers receive the
 * disputes-scoped keys explicitly instead of a cross-domain namespace.
 */
export const DISPUTES_ERROR_MESSAGE_KEYS: ErrorMessageKeys<DisputesTranslationKey> = {
    contactSupport: 'disputes.errors.contactSupport',
    errorCode: 'disputes.errors.errorCode',
    errorCodeSupport: 'disputes.errors.errorCodeSupport',
    notFound: 'disputes.errors.notFound',
    requestInvalid: 'disputes.errors.requestInvalid',
    retry: 'disputes.errors.retry',
    somethingWentWrong: 'disputes.errors.somethingWentWrong',
    unexpected: 'disputes.errors.unexpected',
};

export const DISPUTES_DATA_OVERVIEW_ERROR_KEYS: DataOverviewErrorKeys<DisputesTranslationKey> = {
    accountInvalid: 'disputes.errors.accountInvalid',
    accountUnavailable: 'disputes.errors.accountUnavailable',
};

export const DISPUTES_DATA_OVERVIEW_ACTION_KEYS: DataOverviewActionKeys<DisputesTranslationKey> = {
    contactSupport: 'disputes.actions.contactSupport.labels.reachOut',
    copyDone: 'disputes.actions.copy.labels.done',
    copyErrorCode: 'disputes.actions.copy.labels.errorCode',
    refresh: 'disputes.actions.refresh.labels.default',
};
