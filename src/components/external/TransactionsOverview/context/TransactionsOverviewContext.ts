import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { useFilterBarState } from '../../../internal/FilterBar';
import { IBalanceAccountBase, ITransaction } from '../../../../types';
import { RangeTimestamps } from '../../../internal/Calendar/calendar/timerange';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../utils';

export const enum TransactionsOverviewSplitView {
    TRANSACTIONS = 'transactions',
    DASHBOARD = 'dashboard',
}

export interface ITransactionsOverviewContext {
    availableCurrencies: readonly string[];
    balanceAccount?: IBalanceAccountBase;
    balanceAccounts?: IBalanceAccountBase[];
    balances: Readonly<{ [k: string]: Readonly<{ available: number }> }>;
    categories: readonly ITransaction['category'][];
    currencies: readonly string[];
    currentView: TransactionsOverviewSplitView;
    dateRange?: RangeTimestamps;
    eventCategory: string;
    filterBar: ReturnType<typeof useFilterBarState>;
    setBalanceAccount: (balanceAccount: IBalanceAccountBase | undefined) => void;
    setCategories: (categories: readonly ITransaction['category'][]) => void;
    setCurrencies: (currencies: readonly string[]) => void;
    setCurrentView: (view: TransactionsOverviewSplitView) => void;
    setDateRange: (range?: RangeTimestamps) => void;
    setStatuses: (categories: readonly ITransaction['status'][]) => void;
    statuses: readonly ITransaction['status'][];
}

const context = createContext<ITransactionsOverviewContext>({
    availableCurrencies: EMPTY_ARRAY,
    balances: EMPTY_OBJECT,
    categories: EMPTY_ARRAY,
    currencies: EMPTY_ARRAY,
    currentView: TransactionsOverviewSplitView.TRANSACTIONS,
    eventCategory: 'Transaction component',
    filterBar: EMPTY_OBJECT as any,
    setBalanceAccount: noop,
    setCategories: noop,
    setCurrencies: noop,
    setCurrentView: noop,
    setDateRange: noop,
    setStatuses: noop,
    statuses: EMPTY_ARRAY,
});

export const useTransactionsOverviewContext = () => useContext(context);
export default context;
