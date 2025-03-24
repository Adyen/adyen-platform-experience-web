import { DetailsWithExtraData } from '../TransactionDetails';
import { CustomDataRetrieved, DataCustomizationObject } from '../../types';
import { PayoutsTableFields } from '../PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { IPayoutDetails } from '../../../types';
import { PayoutDetailsWithIdProps } from '../../internal/DataOverviewDetails/types';

export type PayoutDetailsCustomization = DataCustomizationObject<PayoutsTableFields, IPayoutDetails, CustomDataRetrieved>;

export type PayoutDetailsProps = PayoutDetailsWithIdProps & DetailsWithExtraData<PayoutDetailsCustomization>;
