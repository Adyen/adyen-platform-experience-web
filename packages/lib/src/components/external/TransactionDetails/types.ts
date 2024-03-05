import { BalanceAccountProps } from '@src/components';
import { TranslationKey } from '@src/core/Localization/types';
import { ITransaction } from '@src/types';

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
