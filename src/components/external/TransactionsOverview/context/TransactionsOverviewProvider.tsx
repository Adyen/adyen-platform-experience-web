import { PropsWithChildren } from 'preact/compat';
import { useState } from 'preact/hooks';
import useAccountBalances from '../hooks/useAccountBalances';
import TransactionsOverviewContext, { ITransactionsOverviewContext, TransactionsOverviewSplitView } from './TransactionsOverviewContext';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../types';
import { RangeTimestamps } from '../../../internal/Calendar/calendar/timerange';
import { IBalanceAccountBase, type ITransaction } from '../../../../types';
import { useFilterBarState } from '../../../internal/FilterBar';

export type TransactionOverviewProviderProps = PropsWithChildren<
    ExternalUIComponentProps<
        TransactionOverviewComponentProps & {
            balanceAccounts?: IBalanceAccountBase[];
            isLoadingBalanceAccount: boolean;
        }
    >
>;

export default function TransactionsOverviewProvider({ balanceAccounts, children }: TransactionOverviewProviderProps) {
    const [balanceAccount, setBalanceAccount] = useState<ITransactionsOverviewContext['balanceAccount']>();
    const [currentView, setCurrentView] = useState(TransactionsOverviewSplitView.TRANSACTIONS);
    const [statuses, setStatuses] = useState<readonly ITransaction['status'][]>(['Booked']);
    const [categories, setCategories] = useState<readonly ITransaction['category'][]>([]);
    const [currencies, setCurrencies] = useState<readonly string[]>([]);
    const [dateRange, setDateRange] = useState<RangeTimestamps>();

    const eventCategory = 'Transaction component';
    const filterBar = useFilterBarState();
    const { balances, currencies: availableCurrencies } = useAccountBalances(balanceAccount);

    return (
        <TransactionsOverviewContext.Provider
            value={{
                availableCurrencies,
                balanceAccount,
                balanceAccounts,
                balances,
                categories,
                currencies,
                currentView,
                dateRange,
                eventCategory,
                filterBar,
                setBalanceAccount,
                setCategories,
                setCurrencies,
                setCurrentView,
                setDateRange,
                setStatuses,
                statuses,
            }}
        >
            {children}
        </TransactionsOverviewContext.Provider>
    );
}
