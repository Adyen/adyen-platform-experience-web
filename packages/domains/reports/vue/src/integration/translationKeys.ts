import type { DataOverviewActionKeys, DataOverviewErrorKeys, ErrorMessageKeys } from '@integration-components/composables-vue';
import type { ReportsTranslationKey } from '@integration-components/reports/domain';

/**
 * Reports catalog keys supplied to the portable data-overview error helpers. Domain-local
 * translation names are opaque to portable code, so the shared helpers receive the
 * reports-scoped keys explicitly instead of a cross-domain namespace.
 */
export const REPORTS_ERROR_MESSAGE_KEYS: ErrorMessageKeys<ReportsTranslationKey> = {
    contactSupport: 'reports.errors.contactSupport',
    errorCode: 'reports.errors.errorCode',
    errorCodeSupport: 'reports.errors.errorCodeSupport',
    notFound: 'reports.errors.notFound',
    requestInvalid: 'reports.errors.requestInvalid',
    retry: 'reports.errors.retry',
    somethingWentWrong: 'reports.errors.somethingWentWrong',
    unexpected: 'reports.errors.unexpected',
};

export const REPORTS_DATA_OVERVIEW_ERROR_KEYS: DataOverviewErrorKeys<ReportsTranslationKey> = {
    accountInvalid: 'reports.errors.accountInvalid',
    accountUnavailable: 'reports.errors.accountUnavailable',
};

export const REPORTS_DATA_OVERVIEW_ACTION_KEYS: DataOverviewActionKeys<ReportsTranslationKey> = {
    contactSupport: 'reports.actions.contactSupport.labels.reachOut',
    copyDone: 'reports.actions.copy.labels.done',
    copyErrorCode: 'reports.actions.copy.labels.errorCode',
    refresh: 'reports.actions.refresh.labels.default',
};
