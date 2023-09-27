import { useCallback, useEffect, useMemo } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import FilterBar from '../../../internal/FilterBar';
import TextFilter from '../../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { TransactionFilterParam, TransactionsComponentProps } from '../types';
import { DateRangeFilterParam } from '../../../internal/FilterBar/filters/DateFilter/types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { ITransaction } from '../../../../types/models/api/transactions';
import { PaginatedResponseDataWithLinks } from '@src/components/internal/Pagination/types';
import { httpGet } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';
import { parseSearchParams } from '@src/core/Services/requests/utils';
import Alert from '@src/components/internal/Alert';
import { ExternalUIComponentProps } from '../../../types';

const DEFAULT_PAGINATED_TRANSACTIONS_LIMIT = '20';
const DEFAULT_CREATED_SINCE = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

const transactionsFilterParams = [
    TransactionFilterParam.ACCOUNT_HOLDER,
    TransactionFilterParam.BALANCE_ACCOUNT,
    TransactionFilterParam.CREATED_SINCE,
    TransactionFilterParam.CREATED_UNTIL,
];

function Transactions({
    elementRef,
    onAccountSelected,
    onBalanceAccountSelected,
    onFilterChange,
    onTransactionSelected,
    showDetails,
    balancePlatformId,
}: ExternalUIComponentProps<TransactionsComponentProps>) {
    const { i18n, loadingContext, clientKey } = useCoreContext();
    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requiredTransactionFields = {
                createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                limit: DEFAULT_PAGINATED_TRANSACTIONS_LIMIT,
                balancePlatform: pageRequestParams.balancePlatform ?? balancePlatformId,
            };

            const searchParams = parseSearchParams({ ...pageRequestParams, ...requiredTransactionFields });
            const request: HttpOptions = {
                loadingContext: loadingContext,
                clientKey,
                path: 'transactions',
                errorLevel: 'error',
                params: searchParams,
                signal,
            };
            const data = await httpGet<PaginatedResponseDataWithLinks<ITransaction, 'data'>>(request);

            return data;
        },
        [balancePlatformId]
    );

    const { canResetFilters, fetching, filters, records, resetFilters, updateFilters, error, ...paginationProps } = useCursorPaginatedRecords<
        ITransaction,
        'data',
        string,
        TransactionFilterParam
    >(
        useMemo(
            () => ({
                fetchRecords: getTransactions,
                dataField: 'data',
                filterParams: transactionsFilterParams,
                initialFiltersSameAsDefault: false,
                limit: Number(DEFAULT_PAGINATED_TRANSACTIONS_LIMIT),
            }),
            [getTransactions]
        )
    );

    const [updateAccountHolderFilter, updateBalanceAccountFilter, updateCreatedDateFilter] = useMemo(() => {
        const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value || undefined });
                    break;
            }
        };

        const _updateDateFilter = (params: { [P in DateRangeFilterParam]?: string } = {}) => {
            for (const [param, value] of Object.entries(params)) {
                const filter = param === DateRangeFilterParam.FROM ? TransactionFilterParam.CREATED_SINCE : TransactionFilterParam.CREATED_UNTIL;

                updateFilters({ [filter]: value || undefined });
            }
        };

        return [
            _updateTextFilter(TransactionFilterParam.ACCOUNT_HOLDER),
            _updateTextFilter(TransactionFilterParam.BALANCE_ACCOUNT),
            _updateDateFilter,
        ];
    }, [updateFilters]);

    useEffect(() => onFilterChange?.(filters, elementRef), [filters, onFilterChange]);

    const showAlert = useMemo(() => !fetching && error, [fetching, error]);

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
            {showAlert ? (
                <Alert icon={'cross'}>{error?.message ?? i18n.get('unableToLoadTransactions')}</Alert>
            ) : (
                <TransactionList
                    loading={fetching}
                    transactions={records}
                    onAccountSelected={onAccountSelected}
                    onBalanceAccountSelected={onBalanceAccountSelected}
                    onTransactionSelected={onTransactionSelected}
                    showPagination={true}
                    showDetails={showDetails}
                    {...paginationProps}
                />
            )}
        </div>
    );
}

export default Transactions;
