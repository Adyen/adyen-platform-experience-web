import type { TranslationKey } from '../../../../translations';
import type { ITransactionWithDetails } from '../../../../types';

export const FULLY_REFUNDABLE_ONLY = 'fully_refundable_only';
export const NON_REFUNDABLE = 'non_refundable';
export const PARTIALLY_REFUNDABLE_ANY_AMOUNT = 'partially_refundable_any_amount';
export const PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED = 'partially_refundable_with_line_items_required';

export const REFUND_MODES = Object.freeze([
    FULLY_REFUNDABLE_ONLY,
    NON_REFUNDABLE,
    PARTIALLY_REFUNDABLE_ANY_AMOUNT,
    PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED,
] as const) satisfies readonly ITransactionWithDetails['refundDetails']['refundMode'][];

export const REFUND_REASONS = Object.freeze([
    'refundReason.requested',
    'refundReason.issue',
    'refundReason.fraud',
    'refundReason.duplicate',
    'refundReason.other',
] as const) satisfies readonly TranslationKey[];

export const REFUND_REFERENCE_CHAR_LIMIT = 80;
