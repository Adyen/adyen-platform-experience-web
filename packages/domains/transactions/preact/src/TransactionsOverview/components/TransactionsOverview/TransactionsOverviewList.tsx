import { useCallback, useMemo } from 'preact/hooks';
import { classes, TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '../../constants';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useAnalytics/useLandedPageEvent';
import { useDurationEvent } from '@integration-components/hooks-preact/useAnalytics/useDurationEvent';
import TransactionsList from '../TransactionsList/TransactionsList';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import Balances from '../Balances/Balances';
import Alert from '@integration-components/ui-primitives-preact/Alert/Alert';
import Button from '@integration-components/ui-primitives-preact/Button';
import { useCoreContext } from '@integration-components/core/preact';
import { AlertTypeOption } from '@integration-components/ui-primitives-preact/Alert/types';
import { ButtonVariant } from '@integration-components/ui-primitives-preact/Button/types';
import { TranslationKey } from '@integration-components/core';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
} as const;

const TransactionsOverviewList = () => {
    const {
        accountBalancesResult,
        balanceAccounts,
        currenciesLookupResult,
        isLoadingBalanceAccount,
        filters,
        onContactSupport,
        onRecordSelection,
        showDetails,
        transactionsListResult,
        transactionsTotalsResult,
        dataCustomization,
    } = useTransactionsOverviewContext();

    const { i18n } = useCoreContext();
    const { error: balancesError, isWaiting: loadingBalances } = accountBalancesResult;
    const { error: totalsError, isWaiting: loadingTotals } = transactionsTotalsResult;
    const { currenciesDictionary, defaultCurrencySortedCurrencies } = currenciesLookupResult;

    const { sortedBalances, sortedTotals } = useMemo(() => {
        const sortedBalances = defaultCurrencySortedCurrencies.map(currency => currenciesDictionary[currency]!.balances);
        const sortedTotals = defaultCurrencySortedCurrencies.map(currency => currenciesDictionary[currency]!.totals);
        return { sortedBalances, sortedTotals } as const;
    }, [currenciesDictionary, defaultCurrencySortedCurrencies]);

    const renderErrorAlert = useCallback(
        <T extends { canRefresh: boolean; refresh: () => void }>({ canRefresh, refresh }: T, titleKey: TranslationKey) => (
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
        ),
        [i18n]
    );

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
                balanceAccount={filters.balanceAccount}
                currenciesLookupResult={currenciesLookupResult}
                dataCustomization={dataCustomization}
                loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                onContactSupport={onContactSupport}
                onRecordSelection={onRecordSelection}
                showDetails={showDetails}
                transactionsListResult={transactionsListResult}
            />
        </>
    );
};

export default TransactionsOverviewList;
