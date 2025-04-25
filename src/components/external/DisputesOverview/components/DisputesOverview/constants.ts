import { IDispute, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { TabComponentProps } from '../../../../internal/Tabs/types';
import { TranslationKey } from '../../../../../translations';

export const BASE_CLASS = 'adyen-pe-disputes-overview';

export const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';

export const DISPUTE_STATUS_GROUPS = {
    CHARGEBACKS: 'disputes.chargebacks',
    FRAUD_ALERTS: 'disputes.fraudAlerts',
    ONGOING_AND_CLOSED: 'disputes.ongoingAndClosed',
} satisfies Record<IDisputeStatusGroup, TranslationKey>;

export const DISPUTE_STATUS_GROUPS_TABS = Object.entries(DISPUTE_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IDisputeStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IDisputeStatusGroup>['tabs'];

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
    CONSUMER_DISPUTE: 'disputes.consumer_dispute',
    PROCESSING_ERROR: 'disputes.processing_error',
    REQUEST_FOR_INFORMATION: 'disputes.request_for_information',
    AUTHORISATION_ERROR: 'disputes.authorisation_error',
    ADJUSTMENT: 'disputes.adjustment',
    OTHER: 'disputes.other',
} satisfies Record<IDispute['reason']['category'], TranslationKey>;

// TODO - Define this date
export const EARLIEST_DISPUTES_SINCE_DATE = new Date('2024-04-16T00:00:00.000Z').toString();
