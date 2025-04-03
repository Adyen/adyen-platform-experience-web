import { IDisputeDetail } from '../../../types/api/models/disputes';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { DisputesTableFields } from '../DisputesOverview/components/DisputesTable/DisputesTable';
import { DetailsWithExtraData } from '../TransactionDetails';

export type DetailsPropsWithId = { id: string };

export type DisputeDetailsCustomization = DetailsDataCustomizationObject<DisputesTableFields, IDisputeDetail, CustomDataRetrieved>;

export type DisputeDetailsProps = DetailsPropsWithId & DetailsWithExtraData<DisputeDetailsCustomization>;

export interface DisputeDataProps {
    error?: boolean;
    isFetching?: boolean;
    dispute?: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
}
