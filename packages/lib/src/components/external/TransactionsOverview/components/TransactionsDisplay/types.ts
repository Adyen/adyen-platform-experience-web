import { TransactionTableProps } from '@src/components/external/TransactionsOverview/components/TransactionsTable/types';

export interface TransactionDisplayProps extends Omit<TransactionTableProps, 'hasMultipleCurrencies' | 'onRowClick'> {
    balanceAccountDescription?: string;
}
