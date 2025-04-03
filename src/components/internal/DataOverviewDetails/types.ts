import { IBalanceAccountBase, ITransactionWithDetails } from '../../../types';
import { DetailsWithExtraData, TransactionDetailsCustomization } from '../../external';
import { DisputeDetailsCustomization, DisputeDetailsProps } from '../../external/DisputesManagement';
import { DetailsDataCustomizationObject } from '../../types';
import { PayoutDetailsCustomization } from '../../external/PayoutDetails/types';

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
    | ((TransactionDetailsWithIdProps & { type: 'transaction' }) & DetailsWithExtraData<TransactionDetailsCustomization>)
    | (PayoutDetailsWithIdProps & { type: 'payout'; balanceAccountDescription?: string } & DetailsWithExtraData<PayoutDetailsCustomization>)
    | (DisputeDetailsProps & { type: 'dispute' } & DetailsWithExtraData<DisputeDetailsCustomization>);

export type DetailsComponentProps = (TransactionDetailsWithoutIdProps & { type: 'transaction' }) | DetailsWithId;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export type SelectedDetail = {
    type: 'payout' | 'transaction' | 'dispute';
    data: string | TransactionDetailData | PayoutDetailsWithIdProps;
    dataCustomization?: { details?: DetailsDataCustomizationObject<any, any, any> };
};
