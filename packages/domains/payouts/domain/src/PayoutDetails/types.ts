import type { CustomDataRetrieved, DetailsDataCustomizationObject, IPayoutDetails, WithDismissCallback } from '@integration-components/types';

type PayoutDetailsFields = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary' | 'adjustments';

export type PayoutDetailsCustomization = DetailsDataCustomizationObject<PayoutDetailsFields, IPayoutDetails, CustomDataRetrieved>;

export interface PayoutDetailsProps extends WithDismissCallback {
    id: string;
    date: string;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
    };
}
