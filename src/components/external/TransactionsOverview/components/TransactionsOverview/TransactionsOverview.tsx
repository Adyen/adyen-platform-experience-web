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

    const {
        balances,
        currencies,
        isEmpty: balancesEmpty,
        isMultiCurrency: hasMultipleCurrencies,
        isWaiting: loadingBalances,
    } = useAccountBalances({ balanceAccount });

    const { totals, isWaiting: loadingTotals } = useTransactionsTotals({
        currencies,
        filters,
        loadingBalances,
        fetchEnabled: canFetchTransactionsTotals,
    });

    const {
        error: transactionsError,
        fetching: loadingTransactions,
        fields: transactionsFields,
        records: transactions,
        updateLimit: onLimitSelection,
        hasCustomColumn,
        ...paginationProps
    } = useTransactionsList({
        allowLimitSelection,
        dataCustomization,
        filters,
        onFiltersChanged,
        preferredLimit,
        fetchEnabled: canFetchTransactions,
    });

    return (
        <div className={cx(classes.root, { [classes.rootSmall]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>

            <TransactionsFilters
                {...filterBarState}
                availableCurrencies={currencies}
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
                        <TransactionTotals balanceAccount={balanceAccount} loadingTotals={loadingTotals} totals={totals} />
                    </div>
                    <div className={classes.summaryItem}>
                        <Balances
                            balanceAccount={balanceAccount}
                            balances={balances}
                            balancesEmpty={balancesEmpty}
                            loadingBalances={loadingBalances}
                        />
                    </div>
                </div>

                <TransactionsList
                    availableCurrencies={currencies}
                    balanceAccount={balanceAccount}
                    dataCustomization={dataCustomization}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    loadingBalanceAccounts={isLoadingBalanceAccount || !balanceAccounts}
                    loadingTransactions={loadingTransactions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={onLimitSelection}
                    onRecordSelection={onRecordSelection}
                    showDetails={showDetails}
                    transactionsError={transactionsError}
                    transactionsFields={transactionsFields}
                    transactions={transactions}
                    {...paginationProps}
                />
            </>
        </div>
    );
};
