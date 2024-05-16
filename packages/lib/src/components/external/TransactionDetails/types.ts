import { BalanceAccountProps } from '../../../components';
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
