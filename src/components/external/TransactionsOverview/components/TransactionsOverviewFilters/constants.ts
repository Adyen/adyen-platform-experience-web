import { ITransaction } from '../../../../../types';

export const TRANSACTION_CATEGORIES: readonly ITransaction['category'][] = [
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    // 'Fee', /* removed in V2 */
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const;

export const TRANSACTION_STATUSES: readonly ITransaction['status'][] = ['Booked', 'Pending', 'Reversed'] as const;
