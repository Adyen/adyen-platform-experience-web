import type { CustomDataRetrieved, DetailsDataCustomizationObject, DetailsWithExtraData } from '@integration-components/types';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import type { DISPUTE_DETAILS_RESERVED_FIELDS } from './constants';

export type DisputeDetailsFields = (typeof DISPUTE_DETAILS_RESERVED_FIELDS)[number];

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputeDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeCallbackData = {
    id: IDisputeDetail['dispute']['pspReference'];
};

export interface DisputeManagementProps extends DetailsWithExtraData<DisputeDetailsCustomization> {
    id: string;
    onAccept?: (dispute: DisputeCallbackData) => void;
    onDefend?: (dispute: DisputeCallbackData) => void;
}
