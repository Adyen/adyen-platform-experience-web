import { useCallback, useMemo } from 'preact/hooks';
import useSessionAwareRequest from '@src/hooks/useSessionRequest/useSessionRequest';
import useCoreContext from '@src/core/Context/useCoreContext';
import FilterBar from '../../../internal/FilterBar';
import TextFilter from '../../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { TransactionFilterParam, TransactionsComponentProps } from '../types';
import { DateRangeFilterParam } from '../../../internal/FilterBar/filters/DateFilter/types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { ITransaction } from '@src/types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { PaginatedResponseDataWithLinks } from '@src/components/internal/Pagination/types';
import { httpGet } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';
import { parseSearchParams } from '@src/core/Services/requests/utils';
import { isFunction } from '@src/utils/common';
import Alert from '@src/components/internal/Alert';
import { ExternalUIComponentProps } from '../../../types';
import { API_ENDPOINTS } from '@src/core/Services/requests/endpoints';
import './TransactionList.scss';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';

const DEFAULT_CREATED_SINCE = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

const transactionsFilterParams = {
    [TransactionFilterParam.ACCOUNT_HOLDER]: undefined,
    [TransactionFilterParam.BALANCE_ACCOUNT]: undefined,
    [TransactionFilterParam.BALANCE_PLATFORM_ID]: undefined,
    [TransactionFilterParam.CREATED_SINCE]: DEFAULT_CREATED_SINCE,
    [TransactionFilterParam.CREATED_UNTIL]: DEFAULT_CREATED_UNTIL,
};

function Transactions({
    balancePlatformId,
    onTransactionSelected,
    showDetails,
    onFiltersChanged,
    onLimitChanged,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    allowLimitSelection,
    withTitle,
    core
}: ExternalUIComponentProps<TransactionsComponentProps>) {
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { i18n, loadingContext } = useCoreContext();
    const { httpProvider } = useSessionAwareRequest(core);

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const request: Parameters<typeof httpProvider>[0] = {
                loadingContext: loadingContext,
                path: API_ENDPOINTS.transactions.getTransactions,
                errorLevel: 'error',
                params: parseSearchParams({
                    ...pageRequestParams,
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                    balancePlatform: pageRequestParams.balancePlatform ?? balancePlatformId,
                }),
                signal,
            };
            return await httpProvider<PaginatedResponseDataWithLinks<ITransaction, 'data'>>(request, 'GET');
        },
        [balancePlatformId, loadingContext]
    );

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'data', string, TransactionFilterParam>(
            useMemo(
                () => ({
                    fetchRecords: getTransactions,
                    dataField: 'data',
                    filterParams: transactionsFilterParams,
                    initialFiltersSameAsDefault: false,
                    onLimitChanged: _onLimitChanged,
                    onFiltersChanged: _onFiltersChanged,
                    preferredLimit,
                    preferredLimitOptions,
                }),
                [_onFiltersChanged, _onLimitChanged, getTransactions, preferredLimit, preferredLimitOptions]
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

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-transactions__container">
                {withTitle && (
                    <Typography large variant={TypographyVariant.TITLE}>
                        {i18n.get('transactionsOverview')}
                    </Typography>
                )}

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
                {showAlert ? (
                    <Alert icon={'cross'}>{error?.message ?? i18n.get('unableToLoadTransactions')}</Alert>
                ) : (
                    <TransactionList
                        loading={fetching}
                        transactions={records}
                        onTransactionSelected={onTransactionSelected}
                        showPagination={true}
                        showDetails={showDetails}
                        limit={limit}
                        limitOptions={limitOptions}
                        onLimitSelection={updateLimit}
                        {...paginationProps}
                    />
                )}
            </div>
        </div>
    );
}

export default Transactions;
