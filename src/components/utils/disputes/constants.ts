import { TranslationKey } from '../../../translations';
import { IDispute, IDisputeStatus, IDisputeStatusGroup, IDisputeType } from '../../../types/api/models/disputes';

export const DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS = 10;

export const DISPUTE_PAYMENT_SCHEMES = {
    mc: 'Mastercard',
    visa: 'Visa',
    ach: 'ACH Direct Debit',
    amex: 'American Express',
    discover: 'Discover',
    elo: 'Elo',
    jcb: 'JCB',
    pulse: 'PULSE',
    sepadirectdebit: 'SEPA Direct Debit',
    others: 'Others',
} as const;

export const DISPUTE_REASON_CATEGORIES = {
    FRAUD: 'disputes.common.reasonCategories.fraud',
    CONSUMER_DISPUTE: 'disputes.common.reasonCategories.consumerDispute',
    PROCESSING_ERROR: 'disputes.common.reasonCategories.processingError',
    REQUEST_FOR_INFORMATION: 'disputes.common.reasonCategories.requestForInformation',
    AUTHORISATION_ERROR: 'disputes.common.reasonCategories.authorisationError',
    ADJUSTMENT: 'disputes.common.reasonCategories.adjustment',
    OTHER: 'disputes.common.reasonCategories.other',
} satisfies Record<IDispute['reason']['category'], TranslationKey>;

export const DISPUTE_STATUS_GROUPS = {
    CHARGEBACKS: 'disputes.overview.common.statusGroups.chargebacks',
    FRAUD_ALERTS: 'disputes.overview.common.statusGroups.fraudAlerts',
    ONGOING_AND_CLOSED: 'disputes.overview.common.statusGroups.ongoingAndClosed',
} satisfies Record<IDisputeStatusGroup, TranslationKey>;

export const DISPUTE_STATUSES = {
    ACCEPTED: 'disputes.common.statuses.accepted',
    EXPIRED: 'disputes.common.statuses.expired',
    LOST: 'disputes.common.statuses.lost',
    PENDING: 'disputes.common.statuses.pending',
    RESPONDED: 'disputes.common.statuses.responded',
    UNDEFENDED: 'disputes.common.statuses.undefended',
    UNRESPONDED: 'disputes.common.statuses.unresponded',
    WON: 'disputes.common.statuses.won',
} as const satisfies Record<IDisputeStatus, TranslationKey>;

export const DISPUTE_TYPES = {
    CHARGEBACK: 'disputes.management.details.types.chargeback',
    NOTIFICATION_OF_FRAUD: 'disputes.management.details.types.notificationOfFraud',
    REQUEST_FOR_INFORMATION: 'disputes.management.details.types.requestForInformation',
} as const satisfies Record<IDisputeType, TranslationKey>;
