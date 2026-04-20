import { useFilterBarState } from '../../internal/FilterBar';
import useCurrenciesLookup from './hooks/useCurrenciesLookup';
import useTransactionsList from './hooks/useTransactionsList';
import useTransactionsTotals from './hooks/useTransactionsTotals';
import useAccountBalances from '../../../hooks/useAccountBalances';
import useTransactionsViewSwitcher from './hooks/useTransactionsViewSwitcher';
import { IAmount, IBalanceAccountBase, ITransaction, ITransactionCategory, ITransactionStatus } from '../../../types';
import { CustomDataRetrieved, DataCustomizationObject, DataGridCustomColumnConfig, UIElementProps } from '../../types';
import { RangeTimestamps } from '../../internal/Calendar/calendar/timerange';
import { TranslationKey } from '../../../translations';
import { PropsWithChildren } from 'preact/compat';
import { StringWithAutocompleteOptions } from '../../../utils/types';

import { TransactionsTableCols } from './components/TransactionsTable/fields';
import { TransactionDetailsCustomization } from '../TransactionDetails';

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

export type TransactionsOverviewMode = 'overview' | 'insights';

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;
export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;

export interface TransactionsOverviewComponentProps extends UIElementProps {
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

export interface TransactionsOverviewProps extends TransactionsOverviewComponentProps {
    balanceAccounts: IBalanceAccountBase[] | undefined;
    isLoadingBalanceAccount: boolean;
    hideInsights?: boolean;
}

export type TransactionsOverviewProviderProps = PropsWithChildren<
    Omit<TransactionsOverviewProps, 'onError' | 'ref'> & {
        mode?: TransactionsOverviewMode;
    }
>;

export type TransactionsOverviewContextValue = Pick<
    TransactionsOverviewProps,
    'balanceAccounts' | 'dataCustomization' | 'hideTitle' | 'isLoadingBalanceAccount' | 'onContactSupport' | 'onRecordSelection' | 'showDetails'
> & {
    accountBalancesResult: ReturnType<typeof useAccountBalances>;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    filterBarState: ReturnType<typeof useFilterBarState>;
    filters: Readonly<TransactionsFilters>;
    insightsCurrency?: string;
    isTransactionsView: boolean;
    lastFiltersChangeTimestamp: number;
    onFiltersChange: (filters: Readonly<TransactionsFilters>) => void;
    setInsightsCurrency: (currency?: string) => void;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
    insightsTotalsResult: ReturnType<typeof useTransactionsTotals>;
    transactionsViewState: ReturnType<typeof useTransactionsViewSwitcher>;
};
