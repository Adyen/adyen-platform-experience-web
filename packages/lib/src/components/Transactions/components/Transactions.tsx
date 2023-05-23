import { useCallback, useEffect, useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import FilterBar from '../../internal/FilterBar';
import TextFilter from '../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { Transaction, TransactionFilterParam, TransactionsProps } from '../types';
import { DateRangeFilterParam } from '../../internal/FilterBar/filters/DateFilter/types';
import { useCursorPaginatedRecords } from '../../internal/Pagination/hooks';

const DEFAULT_PAGINATED_TRANSACTIONS_LIMIT = 20;

const transactionsFilterParams = [
    TransactionFilterParam.ACCOUNT_HOLDER,
    TransactionFilterParam.BALANCE_ACCOUNT,
    TransactionFilterParam.CREATED_SINCE,
    TransactionFilterParam.CREATED_UNTIL,
];

function Transactions({
    transactions,
    elementRef,
    onAccountSelected,
    onBalanceAccountSelected,
    onFilterChange,
    onTransactionSelected,
    onUpdateTransactions,
}: TransactionsProps) {
    const { i18n } = useCoreContext();

    const onPageRequest = useCallback(
        (pageRequestParams: any) => {
            onUpdateTransactions?.(pageRequestParams, elementRef);
        },
        [onUpdateTransactions, elementRef]
    );

    const { canResetFilters, fetching, filters, records, resetFilters, updateFilters, ...paginationProps } = useCursorPaginatedRecords<
        Transaction,
        'data',
        string,
        TransactionFilterParam
    >(
        useMemo(
            () => ({
                data: transactions,
                dataField: 'data',
                filterParams: transactionsFilterParams,
                initialFiltersSameAsDefault: false,
                limit: DEFAULT_PAGINATED_TRANSACTIONS_LIMIT,
                onPageRequest,
            }),
            [transactions]
        )
    );

    const [updateAccountHolderFilter, updateBalanceAccountFilter, updateCreatedDateFilter] = useMemo(() => {
        const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value });
                    break;
            }
        };

        const _updateDateFilter = (params: { [P in DateRangeFilterParam]?: string } = {}) => {
            for (const [param, value] of Object.entries(params)) {
                const filter = param === DateRangeFilterParam.FROM ? TransactionFilterParam.CREATED_SINCE : TransactionFilterParam.CREATED_UNTIL;

                updateFilters({ [filter]: value });
            }
        };

        return [
            _updateTextFilter(TransactionFilterParam.ACCOUNT_HOLDER),
            _updateTextFilter(TransactionFilterParam.BALANCE_ACCOUNT),
            _updateDateFilter,
        ];
    }, [updateFilters]);

    useEffect(() => onFilterChange?.(filters, elementRef), [filters, onFilterChange]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-title">{i18n.get('transactions')}</div>

            {!!onFilterChange && (
                <FilterBar canResetFilters={canResetFilters} resetFilters={resetFilters}>
                    <TextFilter
                        classNameModifiers={['balanceAccount']}
                        label={i18n.get('balanceAccount')}
                        name={TransactionFilterParam.BALANCE_ACCOUNT}
                        value={filters[TransactionFilterParam.BALANCE_ACCOUNT]}
                        onChange={updateBalanceAccountFilter}
                    />
                    <TextFilter
                        classNameModifiers={['account']}
                        label={i18n.get('account')}
                        name={TransactionFilterParam.ACCOUNT_HOLDER}
                        value={filters[TransactionFilterParam.ACCOUNT_HOLDER]}
                        onChange={updateAccountHolderFilter}
                    />
                    <DateFilter
                        classNameModifiers={['createdSince']}
                        label={i18n.get('dateRange')}
                        name={TransactionFilterParam.CREATED_SINCE}
                        from={filters[TransactionFilterParam.CREATED_SINCE]}
                        to={filters[TransactionFilterParam.CREATED_UNTIL]}
                        onChange={updateCreatedDateFilter}
                    />
                </FilterBar>
            )}
            <TransactionList
                loading={fetching}
                transactions={records}
                onAccountSelected={onAccountSelected}
                onBalanceAccountSelected={onBalanceAccountSelected}
                onTransactionSelected={onTransactionSelected}
                showPagination={true}
                {...paginationProps}
            />
        </div>
    );
}

export default Transactions;
