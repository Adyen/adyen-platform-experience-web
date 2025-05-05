import { TranslationKey } from '../../../translations';
import { IDispute, IDisputeStatus, IDisputeStatusGroup, IDisputeType } from '../../../types/api/models/disputes';

export const DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS = 10;

export const DISPUTE_PAYMENT_SCHEMES = {
    visa: 'Visa',
    mc: 'Mastercard',
    klarna: 'Klarna',
    amex: 'Amex',
    googlepay: 'Google Pay',
    applepay: 'Apple Pay',
} as const;

export const DISPUTE_REASON_CATEGORIES = {
    FRAUD: 'disputes.fraud',
    CONSUMER_DISPUTE: 'disputes.consumerDispute',
    PROCESSING_ERROR: 'disputes.processingError',
    REQUEST_FOR_INFORMATION: 'disputes.requestForInformation',
    AUTHORISATION_ERROR: 'disputes.authorisationError',
    ADJUSTMENT: 'disputes.adjustment',
    OTHER: 'disputes.other',
} satisfies Record<IDispute['reason']['category'], TranslationKey>;

export const DISPUTE_STATUS_GROUPS = {
    CHARGEBACKS: 'disputes.chargebacks',
    FRAUD_ALERTS: 'disputes.fraudAlerts',
    ONGOING_AND_CLOSED: 'disputes.ongoingAndClosed',
} satisfies Record<IDisputeStatusGroup, TranslationKey>;

export const DISPUTE_STATUSES = {
    ACCEPTED: 'disputes.accepted',
    EXPIRED: 'disputes.expired',
    LOST: 'disputes.lost',
    PENDING: 'disputes.pending',
    RESPONDED: 'disputes.responded',
    UNDEFENDED: 'disputes.undefended',
    UNRESPONDED: 'disputes.unresponded',
    WON: 'disputes.won',
} as const satisfies Record<IDisputeStatus, TranslationKey>;

export const DISPUTE_TYPES = {
    CHARGEBACK: 'Chargeback' as TranslationKey,
    NOTIFICATION_OF_FRAUD: 'Notification of fraud' as TranslationKey,
    REQUEST_FOR_INFORMATION: 'Request for information' as TranslationKey,
} as const satisfies Record<IDisputeType, TranslationKey>;
