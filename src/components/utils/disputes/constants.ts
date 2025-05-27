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
    FRAUD: 'disputes.reasonCategory.fraud',
    CONSUMER_DISPUTE: 'disputes.reasonCategory.consumerDispute',
    PROCESSING_ERROR: 'disputes.reasonCategory.processingError',
    REQUEST_FOR_INFORMATION: 'disputes.reasonCategory.requestForInformation',
    AUTHORISATION_ERROR: 'disputes.reasonCategory.authorisationError',
    ADJUSTMENT: 'disputes.reasonCategory.adjustment',
    OTHER: 'disputes.reasonCategory.other',
} satisfies Record<IDispute['reason']['category'], TranslationKey>;

export const DISPUTE_STATUS_GROUPS = {
    CHARGEBACKS: 'disputes.statusGroup.chargebacks',
    FRAUD_ALERTS: 'disputes.statusGroup.fraudAlerts',
    ONGOING_AND_CLOSED: 'disputes.statusGroup.ongoingAndClosed',
} satisfies Record<IDisputeStatusGroup, TranslationKey>;

export const DISPUTE_STATUSES = {
    ACCEPTED: 'disputes.status.accepted',
    EXPIRED: 'disputes.status.expired',
    LOST: 'disputes.status.lost',
    PENDING: 'disputes.status.pending',
    RESPONDED: 'disputes.status.responded',
    UNDEFENDED: 'disputes.status.undefended',
    UNRESPONDED: 'disputes.status.unresponded',
    WON: 'disputes.status.won',
} as const satisfies Record<IDisputeStatus, TranslationKey>;

export const DISPUTE_TYPES = {
    CHARGEBACK: 'disputes.type.chargeback',
    NOTIFICATION_OF_FRAUD: 'disputes.type.notificationOfFraud',
    REQUEST_FOR_INFORMATION: 'disputes.type.requestForInformation',
} as const satisfies Record<IDisputeType, TranslationKey>;
