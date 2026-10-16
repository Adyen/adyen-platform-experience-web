import type { CustomDataRetrieved, DataCustomizationObject, IReport, WithBalanceAccountId } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsDataGridCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps extends PaginationProps, WithBalanceAccountId {
    dataCustomization?: {
        dataGrid?: ReportsDataGridCustomization;
    };
}
