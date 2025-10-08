import { ITransactionTotalWithKey } from '../TransactionTotals/types';

export type TransactionTotalItemProps = {
    total?: ITransactionTotalWithKey;
    hiddenField?: 'incomings' | 'expenses';
    isHeader?: boolean;
    isHovered?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    expensesElemId?: string;
    incomingsElemId?: string;
};
