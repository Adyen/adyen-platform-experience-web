import { useFilterBarState } from '../../internal/FilterBar';
import useCurrenciesLookup from './hooks/useCurrenciesLookup';
import useTransactionsList from './hooks/useTransactionsList';
import useTransactionsTotals from './hooks/useTransactionsTotals';
import useTransactionsFilters from './hooks/useTransactionsFilters';
import useAccountBalances from '../../../hooks/useAccountBalances';
import useTransactionsViewSwitcher from './hooks/useTransactionsViewSwitcher';
import useTransactionsInsightsCurrency from './hooks/useTransactionsInsightsCurrency';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../types';
import { IAmount, IBalanceAccountBase, ITransactionCategory, ITransactionStatus } from '../../../types';
import { RangeTimestamps } from '../../internal/Calendar/calendar/timerange';
import { TranslationKey } from '../../../translations';
import { PropsWithChildren } from 'preact/compat';

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

export type TransactionsOverviewMode = 'overview' | 'insights' | 'transactions';

export type TransactionsOverviewProps = ExternalUIComponentProps<
    TransactionOverviewComponentProps & {
        balanceAccounts: IBalanceAccountBase[] | undefined;
        isLoadingBalanceAccount: boolean;
        hideInsights?: boolean;
    }
>;

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
    insightsCurrency: ReturnType<typeof useTransactionsInsightsCurrency>['currency'];
    transactionsFiltersResult: ReturnType<typeof useTransactionsFilters>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
    insightsTotalsResult: ReturnType<typeof useTransactionsTotals>;
    transactionsViewState: ReturnType<typeof useTransactionsViewSwitcher>;
};
