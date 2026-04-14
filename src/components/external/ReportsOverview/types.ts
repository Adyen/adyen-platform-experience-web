import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IReport } from '../../../types';
import { StringWithAutocompleteOptions } from '../../../utils/types';

type ReportsTableCols = 'createdAt' | 'dateAndReportType' | 'reportType' | 'reportFile';

export type ReportsTableFields = StringWithAutocompleteOptions<ReportsTableCols>;

export type ReportsListCustomization = DataCustomizationObject<ReportsTableFields, IReport[], CustomDataRetrieved[]>;

export interface ReportsOverviewProps extends UIElementProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: { balanceAccountId?: string; reportType?: string; createdSince?: string; createdUntil?: string }) => any;
    preferredLimit?: 10 | 20;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: ReportsListCustomization;
    };
}

export type ReportsOverviewComponentProps = ReportsOverviewProps;
