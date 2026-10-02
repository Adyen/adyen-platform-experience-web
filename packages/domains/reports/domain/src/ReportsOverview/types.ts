import type { CustomDataRetrieved, DataCustomizationObject, IReport, PaginationProps, UIElementProps } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsListCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
    onFiltersChanged?: (filters: { balanceAccountId?: string; reportType?: string; createdSince?: string; createdUntil?: string }) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: ReportsListCustomization;
    };
}

export type ReportsOverviewComponentProps = ReportsOverviewProps;
