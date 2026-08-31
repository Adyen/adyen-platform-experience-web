import type { CustomDataRetrieved, DataCustomizationObject, IReport } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsListCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: { balanceAccountId?: string; reportType?: string; createdSince?: string; createdUntil?: string }) => any;
    preferredLimit?: 10 | 20;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: ReportsListCustomization;
    };
}

export type ReportsOverviewComponentProps = ReportsOverviewProps;
