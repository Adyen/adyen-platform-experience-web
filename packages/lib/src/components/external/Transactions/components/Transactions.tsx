import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import FilterBar from '../../../internal/FilterBar';
import TextFilter from '../../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { TransactionFilterParam, TransactionsComponentProps } from '../types';
import { DateRangeFilterParam } from '../../../internal/FilterBar/filters/DateFilter/types';
import { useCursorPaginatedRecords, usePageLimit } from '../../../internal/Pagination/hooks';
import { ITransaction } from '@src/types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { PaginatedResponseDataWithLinks } from '@src/components/internal/Pagination/types';
import { httpGet } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';
import { parseSearchParams } from '@src/core/Services/requests/utils';
import Alert from '@src/components/internal/Alert';
import { ExternalUIComponentProps } from '../../../types';

const DEFAULT_PAGINATED_TRANSACTIONS_LIMIT = DEFAULT_PAGE_LIMIT;
const DEFAULT_CREATED_SINCE = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

const transactionsFilterParams = [
    { [TransactionFilterParam.ACCOUNT_HOLDER]: undefined },
    { [TransactionFilterParam.BALANCE_ACCOUNT]: undefined },
    { [TransactionFilterParam.CREATED_SINCE]: DEFAULT_CREATED_SINCE },
    { [TransactionFilterParam.CREATED_UNTIL]: DEFAULT_CREATED_UNTIL },
];

function Transactions({
    elementRef,
    onAccountSelected,
    onBalanceAccountSelected,
    onFilterChange,
    onTransactionSelected,
    showDetails,
    balancePlatformId,
    initialListLimit = DEFAULT_PAGINATED_TRANSACTIONS_LIMIT,
}: ExternalUIComponentProps<TransactionsComponentProps>) {
    const [preferredLimit, setPreferredLimit] = useState(initialListLimit);
    const { i18n, clientKey, loadingContext } = useCoreContext();
    const { limit: pageLimit, limitOptions } = usePageLimit({ preferredLimit, limitOptions: LIMIT_OPTIONS });

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const request: HttpOptions = {
                loadingContext: loadingContext,
                clientKey,
                path: 'transactions',
                errorLevel: 'error',
                params: parseSearchParams({
                    ...pageRequestParams,
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                    balancePlatform: pageRequestParams.balancePlatform ?? balancePlatformId,
                }),
                signal,
            };

            return await httpGet<PaginatedResponseDataWithLinks<ITransaction, 'data'>>(request);
        },
        [balancePlatformId, clientKey, loadingContext]
    );

    const { canResetFilters, fetching, filters, records, resetFilters, updateFilters, error, limit, ...paginationProps } = useCursorPaginatedRecords<
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
                initialFiltersSameAsDefault: true,
                limit: pageLimit,
            }),
            [getTransactions, pageLimit]
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

    const showAlert = useMemo(() => !fetching && error, [fetching, error]);
    const updateLimit = useCallback((limit: number) => setPreferredLimit(limit), []);

    useEffect(() => {
        onFilterChange?.({ ...filters, limit: pageLimit }, elementRef);
    }, [filters, onFilterChange, pageLimit]);

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
                    limit={pageLimit}
                    limitOptions={limitOptions}
                    onLimitSelection={updateLimit}
                    {...paginationProps}
                />
            )}
        </div>
    );
}

export default Transactions;
