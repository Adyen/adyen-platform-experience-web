import { DetailsWithExtraData } from '../../Transactions/TransactionDetails';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../../types';
import { IDisputeDetail } from '../../../../types/api/models/disputes';
import { DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './components/DisputesData/constants';

//TODO - Define DisputeDetailsFields

const _fields = [...DISPUTE_DETAILS_RESERVED_FIELDS_SET];

export type DisputeDetailsFields = (typeof _fields)[number];

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
