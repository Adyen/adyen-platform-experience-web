import type { DataCustomizationObject, DetailsWithExtraData } from '@integration-components/types';
import type { PayoutDetailsCustomization } from '@integration-components/payouts/domain';

export interface PayoutDetailsWithIdProps {
    id: string;
    date: string;
}

export type DetailsWithId = PayoutDetailsWithIdProps & {
    type: 'payout';
    balanceAccountDescription?: string;
} & DetailsWithExtraData<PayoutDetailsCustomization>;

export type DetailsComponentProps = DetailsWithId;

export type SelectedDetail = {
    type: 'payout';
    data: PayoutDetailsWithIdProps & { balanceAccountDescription?: string };
    dataCustomization?: { details?: DataCustomizationObject<any, any, any> };
};
