import { ITransactionTotal } from '../../../../../types';

export type TotalsCardProps = {
    totals: ITransactionTotal[];
    hiddenField?: 'incomings' | 'expenses';
    isLoading: boolean;
    fullWidth?: boolean;
};

export type ITransactionTotalWithKey = ITransactionTotal & { key: string };
