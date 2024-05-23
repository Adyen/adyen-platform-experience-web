import { TranslationKey } from '../../../core/Localization/types';
import { IPayoutDetails, ITransaction } from '../../../types';

export interface DetailsWithoutIdProps {
    type: 'payout' | 'transaction';
    data: TransactionDetailData | IPayoutDetails;
    title?: TranslationKey;
}

export interface DetailsWithIdProps {
    type: 'payout' | 'transaction';
    id: string;
    title?: TranslationKey;
}

export type DetailsComponentProps = DetailsWithoutIdProps | DetailsWithIdProps;

export type TransactionDetailData = ITransaction & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData;
};
