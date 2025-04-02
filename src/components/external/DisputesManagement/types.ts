import { DetailsWithExtraData, TransactionDetailsFields } from '../TransactionDetails';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { IDisputeDetail } from '../../../types/api/models/disputes';

//TODO - Define DisputeDetailsFields
export type DisputeDetailsCustomization = DetailsDataCustomizationObject<TransactionDetailsFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeManagementProps = { id: string } & DetailsWithExtraData<DisputeDetailsCustomization>;
