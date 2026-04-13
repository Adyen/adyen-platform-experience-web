import { DetailsWithExtraData } from '../TransactionDetails';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { IDisputeDetail } from '../../../types/api/models/disputes';
import { DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './components/DisputesData/constants';

export type DisputeDetailsFields = typeof DISPUTE_DETAILS_RESERVED_FIELDS_SET extends Set<infer T> ? T : never;

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputeDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeCallbackData = {
    id: IDisputeDetail['dispute']['pspReference'];
};

export type DisputeManagementProps = {
    id: string;
    onContactSupport?: () => void;
    onDisputeAccept?: <T extends DisputeCallbackData>(dispute: T) => void;
    onDisputeDefend?: <T extends DisputeCallbackData>(dispute: T) => void;
    onDismiss?: () => void;
} & DetailsWithExtraData<DisputeDetailsCustomization>;
