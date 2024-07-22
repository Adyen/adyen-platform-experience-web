import { ITransaction } from '../../../types';

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
    | (TransactionDetailsWithIdProps & { type: 'transaction' })
    | (PayoutDetailsWithIdProps & { type: 'payout'; balanceAccountDescription?: string });

export type DetailsComponentProps = (TransactionDetailsWithoutIdProps & { type: 'transaction' }) | DetailsWithId;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
};
