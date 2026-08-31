import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputesTranslationKey } from '../translations/index';

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
} as const satisfies Record<string, DisputesTranslationKey>;

export const EMPTY_TABLE_MESSAGE_KEYS = {
    CHARGEBACKS: { title: 'disputes.overview.chargebacks.errors.listEmpty', message: 'disputes.overview.chargebacks.errors.updateFilters' },
    FRAUD_ALERTS: { title: 'disputes.overview.fraudAlerts.errors.listEmpty', message: 'disputes.overview.fraudAlerts.errors.updateFilters' },
    ONGOING_AND_CLOSED: {
        title: 'disputes.overview.ongoingAndClosed.errors.listEmpty',
        message: 'disputes.overview.ongoingAndClosed.errors.updateFilters',
    },
} as const satisfies Record<IDisputeStatusGroup, { title: DisputesTranslationKey; message: DisputesTranslationKey }>;
