import { FIELD_KEYS, type DisputesTableFields, type DisputesTranslationKey } from '@integration-components/disputes/domain';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';

export { EMPTY_TABLE_MESSAGE_KEYS, FIELD_KEYS, type DisputesTableFields } from '@integration-components/disputes/domain';

export const EARLIEST_DISPUTES_SINCE_DATE = '2025-05-22T00:00:00.000Z';

export const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';

export const DISPUTES_TABLE_FIELDS = Object.keys(FIELD_KEYS) as DisputesTableFields[];

export const LIMIT_SELECT_ARIA_LABEL_KEYS = {
    CHARGEBACKS: 'disputes.overview.chargebacks.limitSelect.a11yLabel',
    FRAUD_ALERTS: 'disputes.overview.fraudAlerts.limitSelect.a11yLabel',
    ONGOING_AND_CLOSED: 'disputes.overview.ongoingAndClosed.limitSelect.a11yLabel',
} as const satisfies Record<IDisputeStatusGroup, DisputesTranslationKey>;

export type ChargebacksSortField = 'dueDate' | 'createdAt';
export type OtherStatusGroupsSortField = 'createdAt';
export type DisputesSortField = ChargebacksSortField | OtherStatusGroupsSortField;
export type DisputesSortDirection = 'asc' | 'desc';
export type ChargebacksSortParams = {
    statusGroup: 'CHARGEBACKS';
    sort: ChargebacksSortField;
    sortDirection: DisputesSortDirection;
};
export type OtherStatusGroupsSortParams = {
    statusGroup: Exclude<IDisputeStatusGroup, 'CHARGEBACKS'>;
    sort: OtherStatusGroupsSortField;
    sortDirection: DisputesSortDirection;
};
export type DisputesSortParams = ChargebacksSortParams | OtherStatusGroupsSortParams;

/** Table columns mapped to the `sort` API parameter. `respondBy` is only available for chargebacks. */
export const SORTABLE_COLUMN_SORT_FIELDS = {
    respondBy: 'dueDate',
    createdAt: 'createdAt',
} as const satisfies Record<string, DisputesSortField>;
