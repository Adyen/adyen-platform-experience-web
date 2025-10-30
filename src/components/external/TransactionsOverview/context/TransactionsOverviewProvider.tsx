import { PropsWithChildren } from 'preact/compat';
import { useCallback, useState } from 'preact/hooks';
import useAccountBalances from '../hooks/useAccountBalances';
import useAnalyticsContext from '../../../../core/Context/analytics/useAnalyticsContext';
import TransactionsOverviewContext, { ITransactionsOverviewContext, TransactionsOverviewSplitView } from './TransactionsOverviewContext';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../types';
import { FilterType, MixpanelProperty } from '../../../../core/Analytics/analytics/user-events';
import { IBalanceAccountBase, type ITransaction } from '../../../../types';

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

    const { balances, currencies: availableCurrencies } = useAccountBalances(balanceAccount);
    const userEvents = useAnalyticsContext();

    const logFilterEvent = useCallback(
        (label: FilterType, actionType: 'reset' | 'update', value?: MixpanelProperty) => {
            try {
                userEvents.addModifyFilterEvent?.({
                    ...(actionType === 'update' ? { value } : {}),
                    category: 'Transaction component',
                    actionType,
                    label,
                });
            } catch (e) {
                console.error(e);
            }
        },
        [userEvents]
    );

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
                logFilterEvent,
                setBalanceAccount,
                setCategories,
                setCurrencies,
                setStatuses,
                statuses,
            }}
        >
            {children}
        </TransactionsOverviewContext.Provider>
    );
}
