import { IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { TranslationKey } from '../../../../../translations';

export const BASE_CLASS = 'adyen-pe-disputes-overview';

export const DISPUTE_STATUS_GROUPS = {
    NEW_CHARGEBACKS: 'disputes.newChargebacks',
    ALL_DISPUTES: 'disputes.allDisputes',
    FRAUD_ALERTS: 'disputes.fraudAlerts',
} as const satisfies Record<IDisputeStatusGroup, TranslationKey>;

// TODO - Define this date
export const EARLIEST_DISPUTES_SINCE_DATE = new Date('2024-04-16T00:00:00.000Z').toString();
