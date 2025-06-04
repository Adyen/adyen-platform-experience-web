import { DetailsWithExtraData } from '../TransactionDetails';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { IDisputeDetail } from '../../../types/api/models/disputes';
import { DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './components/DisputesData/constants';

//TODO - Define DisputeDetailsFields

const _fields = [...DISPUTE_DETAILS_RESERVED_FIELDS_SET];

export type DisputeDetailsFields = (typeof _fields)[number];

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputeDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeManagementProps = {
    id: string;
    onContactSupport?: () => void;
    onDisputeAccept?: (dispute: IDisputeDetail) => void;
    onDisputeDefend?: (dispute: IDisputeDetail) => void;
    onDismiss?: () => void;
} & DetailsWithExtraData<DisputeDetailsCustomization>;
