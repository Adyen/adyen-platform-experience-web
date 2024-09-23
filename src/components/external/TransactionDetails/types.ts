import { StrictUnion } from '../../../utils/types';
import { IBalanceAccountBase, ITransaction } from '../../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export interface DetailsWithExtraData {
    extraDetails: Record<string, any>;
}

export type DetailsComponentProps = StrictUnion<DetailsWithoutIdProps | DetailsWithIdProps> & DetailsWithExtraData;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}
