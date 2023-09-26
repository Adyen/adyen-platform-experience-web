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
import { PageNeighbour, PaginatedResponseDataWithLinks, PaginationType, WithEitherPages } from '@src/components/internal/Pagination/types';
import { httpGet } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';

type PaginationLink = Exclude<Exclude<TransactionsComponentProps['transactions']['_links'], undefined>[PageNeighbour], undefined>;

const DEFAULT_PAGINATED_TRANSACTIONS_LIMIT = '20';

const transactionsFilterParams = [
    TransactionFilterParam.ACCOUNT_HOLDER,
    TransactionFilterParam.BALANCE_ACCOUNT,
    TransactionFilterParam.CREATED_SINCE,
    TransactionFilterParam.CREATED_UNTIL,
];
const pageNeighbours = [PageNeighbour.NEXT, PageNeighbour.PREV] as const;
function Transactions({
    transactions,
    elementRef,
    onAccountSelected,
    onBalanceAccountSelected,
    onFilterChange,
    onTransactionSelected,
    onUpdateTransactions,
    balancePlatformId,
}: TransactionsComponentProps) {
    const { i18n, loadingContext, clientKey } = useCoreContext();
    const getTransactions = async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>) => {
        const {
            createdSince = '2022-05-30T15:07:40Z',
            createdUntil = new Date().toISOString(),
            balancePlatform = balancePlatformId,
            accountHolderId,
            balanceAccountId,
            cursor,
        } = pageRequestParams;

        const searchParams = {
            limit: DEFAULT_PAGINATED_TRANSACTIONS_LIMIT,
            ...(createdSince && { createdSince }),
            ...(createdUntil && { createdUntil }),
            ...(balancePlatform && { balancePlatform }),
            ...(accountHolderId && { accountHolderId }),
            ...(balanceAccountId && { balanceAccountId }),
            ...(cursor && { cursor }),
        };

        const request: HttpOptions = {
            loadingContext: loadingContext,
            clientKey,
            path: 'transactions',
            errorLevel: 'error',
            params: searchParams,
        };
        const { data: records, _links: links } = await httpGet<PaginatedResponseDataWithLinks<ITransaction, 'data'>>(request);

        if (links) {
            const neighbours = Object.fromEntries(
                (Object.entries(links) as [PageNeighbour, PaginationLink][])
                    .filter(([neighbour, link]) => pageNeighbours.includes(neighbour) && link)
                    .map(([key, { href }]) => [key, new URL(href).searchParams])
            );

            return [records, neighbours] as [ITransaction[], WithEitherPages<PaginationType.CURSOR>];
        }

        throw 'Could not retrieve transactions metadata';
    };

    const onPageRequest = useCallback(
        (pageRequestParams: any) => {
            onUpdateTransactions?.(pageRequestParams, elementRef);
        },

        [onUpdateTransactions, elementRef]
    );

    const { canResetFilters, fetching, filters, records, resetFilters, updateFilters, ...paginationProps } = useCursorPaginatedRecords<
        ITransaction,
        'data',
        string,
        TransactionFilterParam
    >(
        useMemo(
            () => ({
                fetchRecords: getTransactions,
                data: transactions,
                dataField: 'data',
                filterParams: transactionsFilterParams,
                initialFiltersSameAsDefault: false,
                limit: Number(DEFAULT_PAGINATED_TRANSACTIONS_LIMIT),
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
