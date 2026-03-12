import { IAmount, IBalanceAccountBase, ITransaction, ITransactionCategory, ITransactionStatus, ITransactionWithDetails } from '../../../types';
import { UIElementProps, DataCustomizationObject, CustomDataRetrieved, DataGridCustomColumnConfig } from '../../types';
import { RangeTimestamps } from '../../internal/Calendar/calendar/timerange';
import { TranslationKey } from '../../../translations';
import { StringWithAutocompleteOptions } from '../../../utils/types';

// Import table fields from component
import { TransactionsTableCols } from './components/TransactionsTable/TransactionsTable';
// Import details customization from TransactionDetails to ensure type compatibility
import { TransactionDetailsCustomization } from '../TransactionDetails/types';

/** Available date range filters for transactions */
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

/** Filter state for transactions overview */
export interface TransactionsFilters {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdDate: RangeTimestamps;
    paymentPspReference?: string;
}

/** View modes for the transactions overview */
export const enum TransactionsView {
    TRANSACTIONS = 'transactions',
    INSIGHTS = 'insights',
}

/** Available transaction table column fields */
export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;

/** Custom column configuration for transactions table */
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;

/** Data customization configuration for transactions list view */
export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;

/** Main component props for TransactionsOverview */
export interface TransactionsOverviewProps extends UIElementProps {
    /** Allow user to change the number of items displayed per page */
    allowLimitSelection?: boolean;
    /** Pre-select a specific balance account */
    balanceAccountId?: string;
    /** Callback when filters change - receives the current filter values */
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        paymentPspReference?: string;
        currencies?: string;
        statuses?: string;
        categories?: string;
        createdSince?: string;
        createdUntil?: string;
    }) => any;
    /** Default number of items per page */
    preferredLimit?: 10 | 20;
    /** Show the details modal when clicking a row */
    showDetails?: boolean;
    /** Callback when a transaction is selected */
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    /** Data customization options */
    dataCustomization?: {
        list?: TransactionsListCustomization;
        details?: TransactionDetailsCustomization;
    };
}

/**
 * Public component props exported from the Element
 * Includes internal props passed by the container
 */
export interface TransactionOverviewComponentProps extends TransactionsOverviewProps {
    /** @internal Balance accounts available for filtering */
    balanceAccounts?: IBalanceAccountBase[];
    /** @internal Loading state for balance accounts */
    isLoadingBalanceAccount?: boolean;
}

/**
 * @deprecated Use TransactionOverviewComponentProps instead.
 */
export type TransactionOverviewProps = TransactionOverviewComponentProps;
