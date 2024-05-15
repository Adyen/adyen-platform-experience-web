import { TranslationKey } from '../../../core/Localization/types';
import { ITransaction } from '../../../types';

export interface TransactionDetailsWithoutIdProps {
    transaction: TransactionDetailData;
    title?: TranslationKey;
}

export interface TransactionDetailsWithIdProps {
    transactionId: string;
    title?: TranslationKey;
}

export type TransactionDetailsComponentProps = TransactionDetailsWithoutIdProps | TransactionDetailsWithIdProps;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type SelectedDetail = {
    data: string | TransactionDetailData;
};
