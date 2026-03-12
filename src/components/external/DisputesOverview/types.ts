import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IDisputeListItem } from '../../../types/api/models/disputes';
import { StringWithAutocompleteOptions } from '../../../utils/types';

/** Available table columns - matches the field names used in the component */
type DisputesTableCols = 'createdAt' | 'disputeType' | 'status' | 'paymentMethod' | 'transactionId';

/** Available disputes table column fields */
export type DisputesTableFields = StringWithAutocompleteOptions<DisputesTableCols>;

/** Dispute status groups for filtering */
export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

/** Data customization configuration for disputes list view */
export type DisputesListCustomization = DataCustomizationObject<DisputesTableFields, IDisputeListItem[], CustomDataRetrieved[]>;

/** Props for the DisputesOverview component */
export interface DisputesOverviewProps extends UIElementProps {
    /** Allow user to change the number of items displayed per page */
    allowLimitSelection?: boolean;
    /** Pre-select a specific balance account */
    balanceAccountId?: string;
    /** Callback when filters change - receives the current filter values */
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        disputeType?: string;
        statuses?: string;
        createdSince?: string;
        createdUntil?: string;
    }) => any;
    /** Default number of items per page */
    preferredLimit?: 10 | 20;
    /** Callback when a dispute is selected */
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    /** Data customization options */
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: never; // Disputes overview doesn't support details view
    };
    /** @deprecated Not supported for disputes - kept for type compatibility */
    showDetails?: boolean;
}

/**
 * Public component props exported from the Element
 */
export type DisputeOverviewComponentProps = DisputesOverviewProps;

/** Main configuration interface */
export interface DisputesOverviewConfig {
    // Placeholder for future configuration options
}
