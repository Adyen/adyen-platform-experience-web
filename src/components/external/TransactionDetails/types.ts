import { TranslationKey } from '../../../core/Localization/types';
import { ITransaction } from '../../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
    title?: TranslationKey;
}

export interface DetailsWithIdProps {
    id: string;
    title?: TranslationKey;
}

export type DetailsComponentProps = DetailsWithoutIdProps | DetailsWithIdProps;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}
