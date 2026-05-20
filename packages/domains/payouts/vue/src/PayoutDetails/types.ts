import type { CoreInstance } from '@integration-components/core/vue';
import type { IPayoutDetails, CustomDataRetrieved, OnDataRetrievedCallback } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

type PayoutDetailsFields = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary' | 'adjustments';

/**
 * Customization shape for PayoutDetails. Mirrors the Preact
 * `DetailsDataCustomizationObject` but inlined here to avoid pulling that
 * Preact-only helper into the Vue domain package.
 */
export interface PayoutDetailsCustomization {
    fields?: { key: StringWithAutocompleteOptions<PayoutDetailsFields>; visibility?: 'visible' | 'hidden' }[];
    onDataRetrieve?: OnDataRetrievedCallback<IPayoutDetails, CustomDataRetrieved>;
}

export interface PayoutDetailsExternalProps {
    core: CoreInstance;
    id: string;
    date: string;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
    };
}
