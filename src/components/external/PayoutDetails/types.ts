import { UIElementProps, CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { IPayoutDetails } from '../../../types';

type PayoutDetailsFields = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary' | 'adjustments';

export type PayoutDetailsCustomization = DetailsDataCustomizationObject<PayoutDetailsFields, IPayoutDetails, CustomDataRetrieved>;

export interface PayoutDetailsProps extends UIElementProps {
    id: string;
    balanceAccountId: string;
    date: string;
    onContactSupport?: () => void;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
    };
}

export type PayoutDetailsComponentProps = PayoutDetailsProps;

export interface PayoutDetailsConfig {}
