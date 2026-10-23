import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputesTranslationKey } from '../shared/types';

export const FIELD_KEYS = {
    status: 'disputes.overview.fields.status',
    respondBy: 'disputes.overview.fields.respondBy',
    createdAt: 'disputes.overview.fields.openedOn',
    paymentMethod: 'disputes.overview.fields.paymentMethod',
    disputeReason: 'disputes.overview.fields.disputeReasonLabel',
    reason: 'disputes.overview.fields.reason',
    currency: 'disputes.overview.fields.currency',
    disputedAmount: 'disputes.overview.fields.disputedAmount',
    totalPaymentAmount: 'disputes.overview.fields.totalPaymentAmount',
} as const satisfies Record<string, DisputesTranslationKey>;

export const EMPTY_TABLE_MESSAGE_KEYS = {
    CHARGEBACKS: { title: 'disputes.overview.chargebacks.errors.listEmpty', message: 'disputes.overview.chargebacks.errors.updateFilters' },
    FRAUD_ALERTS: { title: 'disputes.overview.fraudAlerts.errors.listEmpty', message: 'disputes.overview.fraudAlerts.errors.updateFilters' },
    ONGOING_AND_CLOSED: {
        title: 'disputes.overview.ongoingAndClosed.errors.listEmpty',
        message: 'disputes.overview.ongoingAndClosed.errors.updateFilters',
    },
} as const satisfies Record<IDisputeStatusGroup, { title: DisputesTranslationKey; message: DisputesTranslationKey }>;

export const DISPUTES_PAGE_LIMITS = [10, 20] as const;
