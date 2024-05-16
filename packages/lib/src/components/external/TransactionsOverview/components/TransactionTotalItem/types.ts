import { ITransactionTotal } from '../../../../../types';

export type TransactionTotalItemProps = {
    total?: ITransactionTotal;
    hiddenField?: 'incomings' | 'expenses';
    isHeader?: boolean;
    isHovered?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
};
