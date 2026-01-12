import { useCallback, useMemo } from 'preact/hooks';
import { TransactionOverviewProps } from '../../types';
import { IBalanceAccountBase } from '../../../../../../types';
import { TransactionsListProps } from '../TransactionsList/types';
import { classes, TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '../../constants';
import { useLandedPageEvent } from '../../../../../../hooks/useAnalytics/useLandedPageEvent';
import { useDurationEvent } from '../../../../../../hooks/useAnalytics/useDurationEvent';
import useAccountBalances from '../../../../../../hooks/useAccountBalances';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useTransactionsList from '../../hooks/useTransactionsList';
import TransactionsList from '../TransactionsList/TransactionsList';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import Balances from '../Balances/Balances';
import Alert from '../../../../../internal/Alert/Alert';
import Button from '../../../../../internal/Button';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { AlertTypeOption } from '../../../../../internal/Alert/types';
import { ButtonVariant } from '../../../../../internal/Button/types';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
} as const;

interface TransactionsOverviewListProps
    extends Omit<TransactionsListProps, 'loadingBalanceAccounts'>,
        Pick<TransactionOverviewProps, 'balanceAccounts' | 'isLoadingBalanceAccount'> {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    accountBalancesResult: ReturnType<typeof useAccountBalances>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}

const TransactionsOverviewList = ({
    accountBalancesResult,
    balanceAccount,
    balanceAccounts,
    isLoadingBalanceAccount,
    transactionsListResult,
    transactionsTotalsResult,
    ...transactionsListProps
}: TransactionsOverviewListProps) => {
    const { i18n, updateCore } = useCoreContext();
    const { isWaiting: loadingBalances, balances } = accountBalancesResult;
    const { isWaiting: loadingTotals, totals, error } = transactionsTotalsResult;
    const defaultCurrencyCode = balanceAccount?.defaultCurrencyCode;

    const defaultCurrencyFirstSortFn = useCallback(
        <T extends { currency: string }>({ currency: firstCurrency }: T, { currency: secondCurrency }: T) => {
            if (defaultCurrencyCode) {
                if (firstCurrency === defaultCurrencyCode) return -1;
                if (secondCurrency === defaultCurrencyCode) return 1;
            }
            return firstCurrency.localeCompare(secondCurrency);
        },
        [defaultCurrencyCode]
    );

    const sortedBalances = useMemo(() => [...balances].sort(defaultCurrencyFirstSortFn), [balances, defaultCurrencyFirstSortFn]);
    const sortedTotals = useMemo(() => [...totals].sort(defaultCurrencyFirstSortFn), [totals, defaultCurrencyFirstSortFn]);

    useLandedPageEvent(sharedAnalyticsEventProperties);
    useDurationEvent(sharedAnalyticsEventProperties);

    return (
        <>
            <div className={classes.summary}>
                {error ? (
                    <Alert
                        className={classes.totalsError}
                        type={AlertTypeOption.WARNING}
                        title={i18n.get('transactions.overview.totals.error')}
                        description={
                            <div>
                                <Button variant={ButtonVariant.TERTIARY} onClick={updateCore}>
                                    {i18n.get('common.actions.refresh.labels.default')}
                                </Button>
                            </div>
                        }
                    />
                ) : (
                    <div className={classes.summaryItem}>
                        <TransactionTotals totals={sortedTotals} loadingTotals={loadingTotals} />
                    </div>
                )}
                <div className={classes.summaryItem}>
                    <Balances balances={sortedBalances} loadingBalances={loadingBalances} />
                </div>
            </div>

            <TransactionsList
                accountBalancesResult={accountBalancesResult}
                balanceAccount={balanceAccount}
                loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                transactionsListResult={transactionsListResult}
                {...transactionsListProps}
            />
        </>
    );
};

export default TransactionsOverviewList;
