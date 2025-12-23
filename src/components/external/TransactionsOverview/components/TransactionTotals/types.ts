import { AriaAttributes } from 'preact/compat';
import { ITransactionTotal } from '../../../../../types';

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
