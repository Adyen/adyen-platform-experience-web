import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { IBalanceAccountBase } from '../../../../types';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../utils';
import { FilterType, MixpanelProperty } from '../../../../core/Analytics/analytics/user-events';

export const enum TransactionsOverviewSplitView {
    TRANSACTIONS = 'transactions',
    DASHBOARD = 'dashboard',
}

export interface ITransactionsOverviewContext {
    balanceAccount?: IBalanceAccountBase;
    balanceAccounts?: IBalanceAccountBase[];
    balances: Readonly<{ [k: string]: Readonly<{ available: number }> }>;
    currencies: readonly string[];
    currentView: TransactionsOverviewSplitView;
    logModifyFilterEvent(label: FilterType, actionType: 'reset'): void;
    logModifyFilterEvent(label: FilterType, actionType: 'update', value: MixpanelProperty): void;
    setBalanceAccount: (balanceAccount: IBalanceAccountBase | undefined) => void;
}

const context = createContext<ITransactionsOverviewContext>({
    balances: EMPTY_OBJECT,
    currencies: EMPTY_ARRAY,
    currentView: TransactionsOverviewSplitView.TRANSACTIONS,
    logModifyFilterEvent: noop,
    setBalanceAccount: noop,
});

export const useTransactionsOverviewContext = () => useContext(context);
export default context;
