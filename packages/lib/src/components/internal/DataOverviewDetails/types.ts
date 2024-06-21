import { TranslationKey } from '../../../core/Localization/types';
import { ITransaction } from '../../../types';

//TODO: Revisit those types to find the most appropriate file
export interface TransactionDetailsWithoutIdProps {
    data: TransactionDetailData;
    title?: TranslationKey;
}

export interface PayoutDetailsWithIdProps {
    id: string;
    date: string;
    title?: TranslationKey;
}

export interface TransactionDetailsWithIdProps {
    id: string;
    title?: TranslationKey;
}

export type DetailsWithId = (TransactionDetailsWithIdProps & { type: 'transaction' }) | (PayoutDetailsWithIdProps & { type: 'payout' });

export type DetailsComponentProps = (TransactionDetailsWithoutIdProps & { type: 'transaction' }) | DetailsWithId;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
};
