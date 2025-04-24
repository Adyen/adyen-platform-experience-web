import { IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { TabComponentProps } from '../../../../internal/Tabs/types';
import { TranslationKey } from '../../../../../translations';

export const BASE_CLASS = 'adyen-pe-disputes-overview';

export const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'NEW_CHARGEBACKS';

export const DISPUTE_STATUS_GROUPS = {
    NEW_CHARGEBACKS: 'disputes.newChargebacks',
    ALL_DISPUTES: 'disputes.allDisputes',
    FRAUD_ALERTS: 'disputes.fraudAlerts',
} as const satisfies Record<IDisputeStatusGroup, TranslationKey>;

export const DISPUTE_STATUS_GROUPS_TABS = Object.entries(DISPUTE_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IDisputeStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IDisputeStatusGroup>['tabs'];

// TODO - Define this date
export const EARLIEST_DISPUTES_SINCE_DATE = new Date('2024-04-16T00:00:00.000Z').toString();
