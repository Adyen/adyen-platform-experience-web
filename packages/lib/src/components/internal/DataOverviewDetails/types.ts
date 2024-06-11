import { TranslationKey } from '../../../core/Localization/types';
import { ITransaction } from '../../../types';

export interface TransactionDetailsWithoutIdProps {
    type: 'transaction';
    data: TransactionDetailData;
    title?: TranslationKey;
}

export interface PayoutDetailsWithIdProps {
    type: 'payout';
    id: string;
    date: string;
    title?: TranslationKey;
}

export interface TransactionDetailsWithIdProps {
    type: 'transaction';
    id: string;
    title?: TranslationKey;
}

export type DetailsWithId = TransactionDetailsWithIdProps | PayoutDetailsWithIdProps;

export type DetailsComponentProps = TransactionDetailsWithoutIdProps | DetailsWithId;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
};
