import type { CustomDataRetrieved, DetailsDataCustomizationObject, DetailsWithExtraData, UIElementProps } from '@integration-components/types';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import type { DISPUTE_DETAILS_RESERVED_FIELDS } from './constants';

export type DisputeDetailsFields = (typeof DISPUTE_DETAILS_RESERVED_FIELDS)[number];

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputeDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeCallbackData = {
    id: IDisputeDetail['dispute']['pspReference'];
};

export interface DisputeManagementProps extends UIElementProps, DetailsWithExtraData<DisputeDetailsCustomization> {
    id: string;
    onContactSupport?: () => void;
    onDisputeAccept?: <T extends DisputeCallbackData>(dispute: T) => void;
    onDisputeDefend?: <T extends DisputeCallbackData>(dispute: T) => void;
    onDismiss?: () => void;
}

export type DisputeManagementComponentProps = DisputeManagementProps;
