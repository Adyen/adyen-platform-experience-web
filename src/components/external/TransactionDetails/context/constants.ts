import { TranslationKey } from '../../../../translations';

export const REFUND_REASONS = Object.freeze(['requested_by_customer', 'issue_with_item_sold', 'fraudulent', 'duplicate', 'other'] as const);

export const REFUND_REASONS_KEYS = Object.freeze({
    requested_by_customer: 'transactions.details.common.refundReasons.requestedByCustomer',
    issue_with_item_sold: 'transactions.details.common.refundReasons.issueWithItemSold',
    fraudulent: 'transactions.details.common.refundReasons.fraudulent',
    duplicate: 'transactions.details.common.refundReasons.duplicate',
    other: 'transactions.details.common.refundReasons.other',
} as const) satisfies Readonly<Record<(typeof REFUND_REASONS)[number], TranslationKey>>;

export const REFUND_REFERENCE_CHAR_LIMIT = 80;
