import { DetailsWithExtraData } from '../../Transactions/TransactionDetails';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../../types';
import { PayoutsTableFields } from '../PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { IPayoutDetails } from '../../../../types';
import { PayoutDetailsWithIdProps } from '../../../internal/DataOverviewDetails/types';

export type PayoutDetailsCustomization = DetailsDataCustomizationObject<PayoutsTableFields, IPayoutDetails, CustomDataRetrieved>;

export type PayoutDetailsProps = PayoutDetailsWithIdProps & DetailsWithExtraData<PayoutDetailsCustomization>;
