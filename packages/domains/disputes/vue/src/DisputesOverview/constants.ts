import type { TranslationKey } from '@integration-components/core';
import { FIELD_KEYS, type DisputesTableFields } from '@integration-components/disputes/domain';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';

export { EMPTY_TABLE_MESSAGE_KEYS, FIELD_KEYS, type DisputesTableFields } from '@integration-components/disputes/domain';

export const EARLIEST_DISPUTES_SINCE_DATE = '2025-05-22T00:00:00.000Z';

export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 20];

export const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';

export const DISPUTES_TABLE_FIELDS = Object.keys(FIELD_KEYS) as DisputesTableFields[];

export const LIMIT_SELECT_ARIA_LABEL_KEYS = {
    CHARGEBACKS: 'disputes.overview.chargebacks.limitSelect.a11y.label',
    FRAUD_ALERTS: 'disputes.overview.fraudAlerts.limitSelect.a11y.label',
    ONGOING_AND_CLOSED: 'disputes.overview.ongoingAndClosed.limitSelect.a11y.label',
} as const satisfies Record<IDisputeStatusGroup, TranslationKey>;
