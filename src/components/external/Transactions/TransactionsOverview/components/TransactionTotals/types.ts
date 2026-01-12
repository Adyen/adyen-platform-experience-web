import { AriaAttributes } from 'preact/compat';
import { ITransactionTotal } from '../../../../../../types';

export type TotalsCardProps = {
    totals: readonly Readonly<ITransactionTotal>[];
    hiddenField?: 'incomings' | 'expenses';
    isLoading: boolean;
    fullWidth?: boolean;
} & Pick<AriaAttributes, 'aria-label'>;

export type ITransactionTotalWithKey = ITransactionTotal &
    Partial<{
        expensesElemId: string;
        incomingsElemId: string;
        key: string;
    }>;

export interface TransactionTotalsProps {
    loadingTotals: boolean;
    totals: readonly Readonly<ITransactionTotal>[];
}
