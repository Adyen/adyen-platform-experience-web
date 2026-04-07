import { IAmount, IBalanceAccountBase, ITransaction, ITransactionCategory, ITransactionStatus, ITransactionWithDetails } from '../../../types';
import { UIElementProps, DataCustomizationObject, CustomDataRetrieved, DataGridCustomColumnConfig } from '../../types';
import { RangeTimestamps } from '../../internal/Calendar/calendar/timerange';
import { TranslationKey } from '../../../translations';
import { StringWithAutocompleteOptions } from '../../../utils/types';

import { TransactionsTableCols } from './components/TransactionsTable/fields';
import { TransactionDetailsCustomization } from '../TransactionDetails/types';

type _DateRangeKey<T extends TranslationKey> = T;

export type TransactionsDateRange =
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.last7Days'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.last30Days'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.last180Days'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.thisWeek'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.lastWeek'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.thisMonth'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.lastMonth'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.yearToDate'>
    | _DateRangeKey<'common.filters.types.date.rangeSelect.options.custom'>;

export interface TransactionsFilters {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdDate: RangeTimestamps;
    paymentPspReference?: string;
}

export const enum TransactionsView {
    TRANSACTIONS = 'transactions',
    INSIGHTS = 'insights',
}

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;

export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;

export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;

export interface TransactionsOverviewProps extends UIElementProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        paymentPspReference?: string;
        currencies?: string;
        statuses?: string;
        categories?: string;
        createdSince?: string;
        createdUntil?: string;
    }) => any;
    preferredLimit?: 10 | 20;
    showDetails?: boolean;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: TransactionsListCustomization;
        details?: TransactionDetailsCustomization;
    };
}

export interface TransactionOverviewComponentProps extends TransactionsOverviewProps {
    balanceAccounts?: IBalanceAccountBase[];
    isLoadingBalanceAccount?: boolean;
}

export type TransactionOverviewProps = TransactionOverviewComponentProps;
