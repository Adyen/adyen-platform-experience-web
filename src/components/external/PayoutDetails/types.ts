import { UIElementProps, CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';
import { IPayoutDetails } from '../../../types';

/** Payout details field names */
type PayoutDetailsFields = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary' | 'adjustments';

/** Customization for payout details fields */
export type PayoutDetailsCustomization = DetailsDataCustomizationObject<PayoutDetailsFields, IPayoutDetails, CustomDataRetrieved>;

/** Props for the PayoutDetails component */
export interface PayoutDetailsProps extends UIElementProps {
    /** The payout ID to display details for */
    id: string;
    /** The balance account ID associated with the payout */
    balanceAccountId: string;
    /** The date of the payout (required for internal routing) */
    date: string;
    /** Callback fired when user requests contact support */
    onContactSupport?: () => void;
    /** Data customization options */
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
    };
}

/**
 * Public component props exported from the Element
 */
export type PayoutDetailsComponentProps = PayoutDetailsProps;

/** Main configuration interface */
export interface PayoutDetailsConfig {
    // Placeholder for future configuration options
}
