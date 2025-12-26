import cx from 'classnames';
import { useEffect, useState } from 'preact/hooks';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useTransactionsList from '../../hooks/useTransactionsList';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import { classes, INITIAL_FILTERS } from '../../constants';
import { Header } from '../../../../internal/Header';
import { IBalanceAccountBase } from '../../../../../types';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionTotals from '../TransactionTotals/TransactionTotals';
import TransactionsList from '../TransactionsList/TransactionsList';
import { Balances } from '../Balances/Balances';
import './TransactionsOverview.scss';

export const TransactionsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    dataCustomization,
}: ExternalUIComponentProps<
    TransactionOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const filterBarState = useFilterBarState();
    const userEvents = useAnalyticsContext();

    useEffect(() => {
        userEvents.addEvent?.('Landed on page', {
            category: 'PIE components',
            subCategory: 'Transactions overview',
        });
    }, [userEvents]);

    const { balanceAccount } = filters;
    const { isMobileContainer } = filterBarState;

    const canFetchTransactions = !!balanceAccount?.id;
    const canFetchTransactionsTotals = !!balanceAccount?.id;

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: canFetchTransactions,
        allowLimitSelection,
        dataCustomization,
        filters,
        onFiltersChanged,
        preferredLimit,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        currencies: accountBalancesResult.currencies,
        fetchEnabled: canFetchTransactionsTotals,
        loadingBalances: accountBalancesResult.isWaiting,
        filters,
    });

    const { error, fetching, fields, records, updateLimit, hasCustomColumn, ...paginationProps } = transactionsListResult;

    return (
        <div className={cx(classes.root, { [classes.rootSmall]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>

            <TransactionsFilters
                {...filterBarState}
                availableCurrencies={accountBalancesResult.currencies}
                balanceAccounts={balanceAccounts}
                eventCategory="Transaction component"
                onChange={setFilters}
            />

            <>
                {/*<Balances*/}
                {/*    availableCurrencies={availableCurrencies}*/}
                {/*    currency={activeCurrency}*/}
                {/*    onCurrencyChange={onCurrencyChange}*/}
                {/*    balancesLookup={balancesLookup}*/}
                {/*/>*/}

                <div className={classes.summary}>
                    <div className={classes.summaryItem}>
                        <TransactionTotals
                            balanceAccount={balanceAccount}
                            loadingTotals={transactionsTotalsResult.isWaiting}
                            totals={transactionsTotalsResult.totals}
                        />
                    </div>
                    <div className={classes.summaryItem}>
                        <Balances
                            balanceAccount={balanceAccount}
                            balances={accountBalancesResult.balances}
                            balancesEmpty={accountBalancesResult.isEmpty}
                            loadingBalances={accountBalancesResult.isWaiting}
                        />
                    </div>
                </div>

                <TransactionsList
                    availableCurrencies={accountBalancesResult.currencies}
                    balanceAccount={balanceAccount}
                    dataCustomization={dataCustomization}
                    hasMultipleCurrencies={accountBalancesResult.isMultiCurrency}
                    loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                    loadingTransactions={transactionsListResult.fetching}
                    onContactSupport={onContactSupport}
                    onLimitSelection={transactionsListResult.updateLimit}
                    onRecordSelection={onRecordSelection}
                    showDetails={showDetails}
                    transactionsError={transactionsListResult.error}
                    transactionsFields={transactionsListResult.fields}
                    transactions={transactionsListResult.records}
                    {...paginationProps}
                />
            </>
        </div>
    );
};
