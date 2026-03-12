import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IPayout, IPayoutDetails } from '../../../types';
import { StringWithAutocompleteOptions } from '../../../utils/types';

/** Available table columns - matches the field names used in the component */
type PayoutsTableCols = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary';

/** Available payout table column fields */
export type PayoutsTableFields = StringWithAutocompleteOptions<PayoutsTableCols>;

/** Data customization configuration for payouts list view */
export type PayoutsListCustomization = DataCustomizationObject<PayoutsTableFields, IPayout[], CustomDataRetrieved[]>;

/** Props for the PayoutsOverview component */
export interface PayoutsOverviewProps extends UIElementProps {
    /** Allow user to change the number of items displayed per page */
    allowLimitSelection?: boolean;
    /** Pre-select a specific balance account */
    balanceAccountId?: string;
    /** Callback when filters change - receives the current filter values */
    onFiltersChanged?: (filters: { balanceAccountId?: string; createdSince?: string; createdUntil?: string }) => any;
    /** Default number of items per page */
    preferredLimit?: 10 | 20;
    /** Show the details modal when clicking a row */
    showDetails?: boolean;
    /** Callback when a payout is selected */
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;
    /** Data customization options */
    dataCustomization?: {
        list?: PayoutsListCustomization;
        details?: never; // Payouts overview doesn't support details view
    };
}

/**
 * Public component props exported from the Element
 */
export type PayoutsOverviewComponentProps = PayoutsOverviewProps;

/** Main configuration interface */
export interface PayoutsOverviewConfig {
    // Placeholder for future configuration options
}
