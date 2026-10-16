import type { CustomDataRetrieved, DataCustomizationObject, IReport, UIElementProps } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsDataGridCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
    dataCustomization?: {
        dataGrid?: ReportsDataGridCustomization;
    };
}

export type ReportsOverviewComponentProps = ReportsOverviewProps;
