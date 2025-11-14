import { ITransactionTotal } from '../../../../../types';
import { AriaAttributes } from 'preact/compat';

export type TotalsCardProps = {
    totals: readonly Readonly<ITransactionTotal>[];
    hiddenField?: 'incomings' | 'expenses';
    isLoading: boolean;
    fullWidth?: boolean;
} & Pick<AriaAttributes, 'aria-label'>;

export type ITransactionTotalWithKey = ITransactionTotal & {
    expensesElemId: string;
    incomingsElemId: string;
    key: string;
};
