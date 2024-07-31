import type { TranslationKey } from '../../../../core/Localization/types';

export const REFUND_REASONS = Object.freeze([
    'refundReason.requested',
    'refundReason.issue',
    'refundReason.fraud',
    'refundReason.duplicate',
    'refundReason.other',
] as const) satisfies readonly TranslationKey[];

export const REFUND_REFERENCE_CHAR_LIMIT = 80;
