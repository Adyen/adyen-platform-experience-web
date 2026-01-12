import { DetailsWithExtraData } from '../../external';
import { DetailsDataCustomizationObject } from '../../types';
import { IBalanceAccountBase, ITransactionWithDetails } from '../../../types';
import { PayoutDetailsCustomization } from '../../external/Payouts/PayoutDetails/types';

export interface PayoutDetailsWithIdProps {
    id: string;
    date: string;
}

export type DetailsWithId = PayoutDetailsWithIdProps & {
    type: 'payout';
    balanceAccountDescription?: string;
} & DetailsWithExtraData<PayoutDetailsCustomization>;

export type DetailsComponentProps = DetailsWithId;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
    dataCustomization?: { details?: DetailsDataCustomizationObject<any, any, any> };
};
