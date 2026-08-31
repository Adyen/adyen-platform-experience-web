import { IDisputeReasonCategory, IDisputeStatus, IDisputeType } from '@integration-components/types/api/models/disputes';
import { DISPUTE_REASON_CATEGORIES, DISPUTE_STATUSES, DISPUTE_TYPES } from '../constants';
import { isDisputesTranslationKey, type DisputesTranslationKey } from '../translations';

/**
 * The exact dispute keys these helpers can produce. Shared with the Preact elements, whose
 * `Localization` i18n accepts the public V1 catalog: this subset keeps both the Preact and the
 * Vue i18n assignable without exposing the full domain catalog union.
 */
type DisputesTypeTranslationKey =
    | Extract<DisputesTranslationKey, `disputes.common.reasonCategories.${string}`>
    | Extract<DisputesTranslationKey, `disputes.common.statuses.${string}`>
    | Extract<DisputesTranslationKey, `disputes.management.details.types.${string}`>;

type DisputesTypeI18n = Readonly<{ get(key: DisputesTypeTranslationKey): string }>;

const getDynamicTranslation = (i18n: DisputesTypeI18n, key: string | undefined, value?: string): string | undefined =>
    key && isDisputesTranslationKey(key) ? i18n.get(key as DisputesTypeTranslationKey) : value;

export const getDisputeReason = (i18n: DisputesTypeI18n, reason?: string): string | undefined =>
    getDynamicTranslation(
        i18n,
        reason && (DISPUTE_REASON_CATEGORIES[reason as IDisputeReasonCategory] ?? `disputes.common.reasonCategories.${reason}`),
        reason
    );

export const getDisputeStatus = (i18n: DisputesTypeI18n, status?: string): string | undefined =>
    getDynamicTranslation(i18n, status && (DISPUTE_STATUSES[status as IDisputeStatus] ?? `disputes.common.statuses.${status}`), status);

export const getDisputeType = (i18n: DisputesTypeI18n, type?: string): string | undefined =>
    getDynamicTranslation(i18n, type && (DISPUTE_TYPES[type as IDisputeType] ?? `disputes.management.details.types.${type}`), type);
