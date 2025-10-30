import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { IBalanceAccountBase, ITransaction } from '../../../../types';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../utils';
import { FilterType, MixpanelProperty } from '../../../../core/Analytics/analytics/user-events';

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
    logFilterEvent(label: FilterType, actionType: 'reset'): void;
    logFilterEvent(label: FilterType, actionType: 'update', value: MixpanelProperty): void;
    setBalanceAccount: (balanceAccount: IBalanceAccountBase | undefined) => void;
    setCategories: (categories: readonly ITransaction['category'][]) => void;
}

const context = createContext<ITransactionsOverviewContext>({
    availableCurrencies: EMPTY_ARRAY,
    balances: EMPTY_OBJECT,
    categories: EMPTY_ARRAY,
    currencies: EMPTY_ARRAY,
    currentView: TransactionsOverviewSplitView.TRANSACTIONS,
    logFilterEvent: noop,
    setBalanceAccount: noop,
    setCategories: noop,
});

export const useTransactionsOverviewContext = () => useContext(context);
export default context;
