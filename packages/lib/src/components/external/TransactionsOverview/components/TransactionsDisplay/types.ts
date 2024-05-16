import { TransactionTableProps } from '../TransactionsTable/types';

export interface TransactionDisplayProps extends Omit<TransactionTableProps, 'hasMultipleCurrencies' | 'onRowClick'> {
    balanceAccountDescription?: string;
}
