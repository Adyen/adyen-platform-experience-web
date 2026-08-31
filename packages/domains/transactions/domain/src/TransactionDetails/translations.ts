import type { IRefundReason } from '@integration-components/types';
import { isTransactionsTranslationKey, type TransactionsTranslationKey } from '../translations';

/**
 * The exact transaction keys these helpers can produce. Shared with the Preact elements, whose
 * `Localization` i18n accepts the public V1 catalog: this subset keeps both the Preact and the
 * Vue i18n assignable without exposing the full domain catalog union.
 */
type TransactionsTypeTranslationKey =
    | Extract<TransactionsTranslationKey, `transactions.details.summary.adjustments.types.${string}`>
    | Extract<TransactionsTranslationKey, `transactions.common.types.${string}`>
    | Extract<TransactionsTranslationKey, `transactions.common.statuses.${string}`>
    | Extract<TransactionsTranslationKey, `transactions.details.timeline.statuses.${string}`>
    | Extract<TransactionsTranslationKey, `transactions.details.timeline.types.${string}`>
    | Extract<TransactionsTranslationKey, `transactions.details.common.refundReasons.${string}`>;

type TransactionsTypeI18n = Readonly<{ get(key: TransactionsTypeTranslationKey): string }>;

const getDynamicTranslation = (
    i18n: TransactionsTypeI18n,
    prefix: string,
    value?: string,
    suffix = '',
    fallbackToValue = false
): string | undefined => {
    if (value === undefined) return undefined;
    const key = `${prefix}${value}${suffix}`;
    return isTransactionsTranslationKey(key) ? i18n.get(key as TransactionsTypeTranslationKey) : fallbackToValue ? value : undefined;
};

export const getTransactionAmountAdjustmentType = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.details.summary.adjustments.types.', value, '', true);

export const getTransactionAmountAdjustmentTypeInformation = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.details.summary.adjustments.types.', value, '.information');

export const getTransactionCategory = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.common.types.', value, '', true);

export const getTransactionCategoryDescription = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.common.types.', value, '.description');

export const getTransactionStatus = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.common.statuses.', value, '', true);

export const getTransactionTimelineTxStatus = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.details.timeline.statuses.', value, '', true);

export const getTransactionTimelineTxType = (i18n: TransactionsTypeI18n, value?: string): string | undefined =>
    getDynamicTranslation(i18n, 'transactions.details.timeline.types.', value, '', true);

export const REFUND_REASONS_KEYS = Object.freeze({
    requested_by_customer: 'transactions.details.common.refundReasons.requestedByCustomer',
    issue_with_item_sold: 'transactions.details.common.refundReasons.issueWithItemSold',
    fraudulent: 'transactions.details.common.refundReasons.fraudulent',
    duplicate: 'transactions.details.common.refundReasons.duplicate',
    other: 'transactions.details.common.refundReasons.other',
} as const) satisfies Readonly<Record<IRefundReason, TransactionsTranslationKey>>;

export const getTransactionRefundReason = (i18n: TransactionsTypeI18n, reason?: string): string | undefined => {
    if (reason === undefined) return undefined;
    const key = REFUND_REASONS_KEYS[reason as IRefundReason] ?? `transactions.details.common.refundReasons.${reason}`;
    return isTransactionsTranslationKey(key) ? i18n.get(key as TransactionsTypeTranslationKey) : reason;
};
