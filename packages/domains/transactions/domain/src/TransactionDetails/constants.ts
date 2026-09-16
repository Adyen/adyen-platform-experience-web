import type { TranslationKey } from '@integration-components/core';
import type { IRefundStatus } from '@integration-components/types';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_DETAILS } from '../TransactionsOverview/analyticsConstants';
import { TRANSACTION_FIELDS } from '../TransactionsOverview/fields';
import { DetailsTab, TransactionDetails, TransactionDetailsFields } from './types';

export { REFUND_REASONS_KEYS } from './translations';

export const TX_DETAILS_RESERVED_FIELDS_SET = new Set<TransactionDetailsFields>([
    ...(['status', 'category', 'paymentMethod', 'bankAccount', 'balanceAccount', 'id', 'balanceAccountId'] satisfies (keyof TransactionDetails)[]),
    ...TRANSACTION_FIELDS,
    'account',
    'deductedAmount',
    'description',
    'lineItems',
    'merchantReference',
    'originalAmount',
    'paymentPspReference',
    'pspReference',
    'refundDetails',
    'refundMetadata',
    'refundPspReference',
    'refundReason',
] as const);

export const TX_DETAILS_FIELDS_REMAPS = {
    balanceAccount: 'account',
    balanceAccountId: (tx?: TransactionDetails) => {
        const account = tx?.balanceAccount;
        if (account && !account.description) return 'account';
    },
    description: (tx?: TransactionDetails) => {
        if (tx?.balanceAccount?.description) return 'account';
    },
} as const;

export const TX_DETAILS_TABS: readonly Readonly<{ id: DetailsTab; label: TranslationKey; content: null }>[] = [
    { id: DetailsTab.SUMMARY, label: 'transactions.details.views.summary', content: null } as const,
    { id: DetailsTab.DETAILS, label: 'transactions.details.views.details', content: null } as const,
    { id: DetailsTab.TIMELINE, label: 'transactions.details.views.timeline', content: null } as const,
] as const;

export const REFUND_STATUSES = ['completed', 'in_progress', 'failed'] as const satisfies readonly IRefundStatus[];
export const REFUND_REASONS = ['requested_by_customer', 'issue_with_item_sold', 'fraudulent', 'duplicate', 'other'] as const;

export const REFUND_REFERENCE_CHAR_LIMIT = 80;

export const sharedTransactionDetailsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_DETAILS,
} as const;
