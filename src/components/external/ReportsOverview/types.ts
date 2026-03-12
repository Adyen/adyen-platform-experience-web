import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IReport } from '../../../types';
import { StringWithAutocompleteOptions } from '../../../utils/types';

/** Available table columns */
type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

/** Available reports table column fields */
export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

/** Data customization configuration for reports list view */
export type ReportsListCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

/** Props for the ReportsOverview component */
export interface ReportsOverviewProps extends UIElementProps {
    /** Allow user to change the number of items displayed per page */
    allowLimitSelection?: boolean;
    /** Pre-select a specific balance account */
    balanceAccountId?: string;
    /** Callback when filters change - receives the current filter values */
    onFiltersChanged?: (filters: { balanceAccountId?: string; reportType?: string; createdSince?: string; createdUntil?: string }) => any;
    /** Default number of items per page */
    preferredLimit?: 10 | 20;
    /** Callback when a report is selected */
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    /** Data customization options */
    dataCustomization?: {
        list?: ReportsListCustomization;
    };
}

/**
 * Public component props exported from the Element
 */
export type ReportsOverviewComponentProps = ReportsOverviewProps;

/** Main configuration interface */
export interface ReportsOverviewConfig {
    // Placeholder for future configuration options
}
