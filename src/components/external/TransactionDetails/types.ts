import type { StrictUnion } from '../../../utils/types';
import type { IBalanceAccountBase, ITransactionWithDetails } from '../../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export interface DetailsWithExtraData {
    extraDetails?: Record<string, any>;
}

export type DetailsComponentProps = StrictUnion<DetailsWithoutIdProps | DetailsWithIdProps> & DetailsWithExtraData;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export interface TransactionDataProps {
    error?: boolean;
    isFetching?: boolean;
    transaction?: TransactionDetailData;
}
