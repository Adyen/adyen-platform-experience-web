import { IBalanceAccountBase, ITransactionWithDetails } from '../../../types';
import { DetailsWithExtraData } from '../../external';

//TODO: Revisit those types to find the most appropriate file
export interface TransactionDetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface PayoutDetailsWithIdProps {
    id: string;
    date: string;
}

export interface TransactionDetailsWithIdProps {
    id: string;
}

export type DetailsWithId =
    | ((TransactionDetailsWithIdProps & { type: 'transaction' }) & DetailsWithExtraData)
    | (PayoutDetailsWithIdProps & { type: 'payout'; balanceAccountDescription?: string });

export type DetailsComponentProps = (TransactionDetailsWithoutIdProps & { type: 'transaction' }) | DetailsWithId;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
};
