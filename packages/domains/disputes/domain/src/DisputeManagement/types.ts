import type { CustomDataRetrieved, DetailsDataCustomizationObject, DetailsWithExtraData, WithDismissCallback } from '@integration-components/types';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import type { DISPUTE_DETAILS_RESERVED_FIELDS } from './constants';

export type DisputeDetailsFields = (typeof DISPUTE_DETAILS_RESERVED_FIELDS)[number];

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputeDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeCallbackData = {
    id: IDisputeDetail['dispute']['pspReference'];
};

export interface DisputeManagementProps extends DetailsWithExtraData<DisputeDetailsCustomization>, WithDismissCallback {
    id: string;
    onDisputeAccept?: <T extends DisputeCallbackData>(dispute: T) => void;
    onDisputeDefend?: <T extends DisputeCallbackData>(dispute: T) => void;
}
