import type { TranslationKey } from '@integration-components/core';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';

export const BASE_CLASS = 'adyen-pe-disputes-overview';
export const BASE_XS_CLASS = `${BASE_CLASS}--xs`;
export const CONTAINER_CLASS = `${BASE_CLASS}-container`;
export const TABS_CONTAINER_CLASS = `${BASE_CLASS}__tabs-container`;
export const TABLE_CLASS = 'adyen-pe-disputes-table';

export const EARLIEST_DISPUTES_SINCE_DATE = '2025-05-22T00:00:00.000Z';

export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 20];

export const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';

export const FIELD_KEYS = {
    status: 'disputes.overview.common.fields.status',
    respondBy: 'disputes.overview.common.fields.respondBy',
    createdAt: 'disputes.overview.common.fields.openedOn',
    paymentMethod: 'disputes.overview.common.fields.paymentMethod',
    disputeReason: 'disputes.overview.common.fields.disputeReason',
    reason: 'disputes.overview.common.fields.reason',
    currency: 'disputes.overview.common.fields.currency',
    disputedAmount: 'disputes.overview.common.fields.disputedAmount',
    totalPaymentAmount: 'disputes.overview.common.fields.totalPaymentAmount',
} as const satisfies Record<string, TranslationKey>;

export const DISPUTES_TABLE_FIELDS = Object.keys(FIELD_KEYS) as DisputesTableFields[];

export type DisputesTableFields = keyof typeof FIELD_KEYS;

export const EMPTY_TABLE_MESSAGE_KEYS = {
    CHARGEBACKS: { title: 'disputes.overview.chargebacks.errors.listEmpty', message: 'disputes.overview.chargebacks.errors.updateFilters' },
    FRAUD_ALERTS: { title: 'disputes.overview.fraudAlerts.errors.listEmpty', message: 'disputes.overview.fraudAlerts.errors.updateFilters' },
    ONGOING_AND_CLOSED: {
        title: 'disputes.overview.ongoingAndClosed.errors.listEmpty',
        message: 'disputes.overview.ongoingAndClosed.errors.updateFilters',
    },
} as const satisfies Record<IDisputeStatusGroup, { title: TranslationKey; message: TranslationKey }>;

export const LIMIT_SELECT_ARIA_LABEL_KEYS = {
    CHARGEBACKS: 'disputes.overview.chargebacks.limitSelect.a11y.label',
    FRAUD_ALERTS: 'disputes.overview.fraudAlerts.limitSelect.a11y.label',
    ONGOING_AND_CLOSED: 'disputes.overview.ongoingAndClosed.limitSelect.a11y.label',
} as const satisfies Record<IDisputeStatusGroup, TranslationKey>;
