import type { CustomDataRetrieved, DataCustomizationObject, IReport } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { ReportsTableCols } from './constants';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsDataGridCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps extends PaginationProps {
    dataCustomization?: {
        dataGrid?: ReportsDataGridCustomization;
    };
}
