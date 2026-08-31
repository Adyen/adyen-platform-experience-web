import type { DataOverviewActionKeys } from '@integration-components/composables-vue';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';

/**
 * Pay by Link catalog keys supplied to the portable data-overview error helpers. Domain-local
 * translation names are opaque to portable code, so the shared helpers receive the
 * payByLink-scoped keys explicitly instead of a cross-domain namespace.
 */
export const PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS: DataOverviewActionKeys<PayByLinkTranslationKey> = {
    contactSupport: 'payByLink.actions.contactSupport.labels.reachOut',
    copyDone: 'payByLink.actions.copy.labels.done',
    copyErrorCode: 'payByLink.actions.copy.labels.errorCode',
    refresh: 'payByLink.actions.refresh.labels.default',
};
