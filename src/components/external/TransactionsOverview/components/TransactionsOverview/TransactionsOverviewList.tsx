import { useCallback, useMemo } from 'preact/hooks';
import { TransactionOverviewProps } from '../../types';
import { IBalanceAccountBase } from '../../../../../types';
import { TransactionsListProps } from '../TransactionsList/types';
import { classes, TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '../../constants';
import { useLandedPageEvent } from '../../../../../hooks/useAnalytics/useLandedPageEvent';
import { useDurationEvent } from '../../../../../hooks/useAnalytics/useDurationEvent';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useTransactionsList from '../../hooks/useTransactionsList';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';
import TransactionsList from '../TransactionsList/TransactionsList';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import Balances from '../Balances/Balances';
import Alert from '../../../../internal/Alert/Alert';
import Button from '../../../../internal/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { TranslationKey } from '../../../../../translations';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
} as const;

interface TransactionsOverviewListProps
    extends Omit<TransactionsListProps, 'loadingBalanceAccounts'>,
        Pick<TransactionOverviewProps, 'balanceAccounts' | 'isLoadingBalanceAccount'> {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    accountBalancesResult: ReturnType<typeof useAccountBalances>;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}

const TransactionsOverviewList = ({
    accountBalancesResult,
    balanceAccount,
    balanceAccounts,
    currenciesLookupResult,
    isLoadingBalanceAccount,
    transactionsListResult,
    transactionsTotalsResult,
    ...transactionsListProps
}: TransactionsOverviewListProps) => {
    const { i18n } = useCoreContext();
    const { error: balancesError, isWaiting: loadingBalances } = accountBalancesResult;
    const { error: totalsError, isWaiting: loadingTotals } = transactionsTotalsResult;
    const { currenciesDictionary, defaultCurrencySortedCurrencies } = currenciesLookupResult;

    const { sortedBalances, sortedTotals } = useMemo(() => {
        const sortedBalances = defaultCurrencySortedCurrencies.map(currency => currenciesDictionary[currency]!.balances);
        const sortedTotals = defaultCurrencySortedCurrencies.map(currency => currenciesDictionary[currency]!.totals);
        return { sortedBalances, sortedTotals } as const;
    }, [currenciesDictionary, defaultCurrencySortedCurrencies]);

    const renderErrorAlert = useCallback(<T extends { canRefresh: boolean; refresh: () => void }>({ canRefresh, refresh }: T, titleKey: TranslationKey) => (
        <Alert
            className={classes.totalsError}
            type={AlertTypeOption.WARNING}
            title={i18n.get(titleKey)}
            description={
                <div>
                    <Button variant={ButtonVariant.TERTIARY} onClick={refresh} disabled={!canRefresh}>
                        {i18n.get('common.actions.refresh.labels.default')}
                    </Button>
                </div>
            }
        />
    ), [i18n]);

    useLandedPageEvent(sharedAnalyticsEventProperties);
    useDurationEvent(sharedAnalyticsEventProperties);

    return (
        <>
            <div className={classes.summary}>
                <div className={classes.summaryItem}>
                    {totalsError ? (
                        renderErrorAlert(transactionsTotalsResult, 'transactions.overview.totals.error')
                    ) : (
                        <TransactionTotals totals={sortedTotals} loadingTotals={loadingTotals} />
                    )}
                </div>

                <div className={classes.summaryItem}>
                    {balancesError ? (
                        renderErrorAlert(accountBalancesResult, 'transactions.overview.balances.error')
                    ) : (
                        <Balances balances={sortedBalances} loadingBalances={loadingBalances} />
                    )}
                </div>
            </div>

            <TransactionsList
                balanceAccount={balanceAccount}
                currenciesLookupResult={currenciesLookupResult}
                loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                transactionsListResult={transactionsListResult}
                {...transactionsListProps}
            />
        </>
    );
};

export default TransactionsOverviewList;
