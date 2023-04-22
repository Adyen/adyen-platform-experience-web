import { useEffect, useMemo } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
import FilterBar from '../../internal/FilterBar';
import TextFilter from '../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { Transaction, TransactionFilterParam, TransactionsPageProps } from '../types';
import { DateRangeFilterParam } from '../../internal/FilterBar/filters/DateFilter/types';
import './Transactions.scss';
import { useCursorPaginatedRecords } from '../../internal/Pagination/hooks';
import { PaginatedRecordsFetcherParams, WithEitherPages } from '../../internal/Pagination/hooks/types';

const filterParams = [
    TransactionFilterParam.ACCOUNT_HOLDER,
    TransactionFilterParam.BALANCE_ACCOUNT,
    TransactionFilterParam.CREATED_SINCE,
    TransactionFilterParam.CREATED_UNTIL
];

const fetchRecords = async ({ signal, ...params }: PaginatedRecordsFetcherParams<string, TransactionFilterParam>) => {
    const { host, protocol } = window.location;
    const url = new URL(`${protocol}//${host}/transactions`);

    for (const [param, value] of Object.entries(params)) {
        if (value) url.searchParams.set(param, value);
    }

    const response = await fetch(url, {
        signal,
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());

    if (response.error) throw 'Could not retrieve the list of transactions';

    const {data: records, _links: links} = (response as TransactionsPageProps['transactions']);

    if (links) {
        const neighbours = Object.fromEntries(Object.entries(links).map(([key, {href}]) => [key, new URL(href).searchParams]));
        return [records, neighbours] as [Transaction[], WithEitherPages];
    }

    throw 'Could not retrieve transactions metadata';
};

function Transactions({
    elementRef,
    onAccountSelected,
    onBalanceAccountSelected,
    onFilterChange,
    onTransactionSelected
}: any) {
    const { i18n } = useCoreContext();

    const {
        canResetFilters,
        fetching,
        filters,
        records,
        resetFilters,
        updateFilters,
        ...paginationProps
    } = useCursorPaginatedRecords<Transaction, string, TransactionFilterParam>(fetchRecords, filterParams);

    const [
        updateAccountHolderFilter,
        updateBalanceAccountFilter,
        updateCreatedDateFilter
    ] = useMemo(() => {
        const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value });
                    break;
            }
        };

        const _updateDateFilter = (params: {[P in DateRangeFilterParam]?: string} = {}) => {
            for (const [ param, value ] of Object.entries(params)) {
                const filter = param === DateRangeFilterParam.FROM
                    ? TransactionFilterParam.CREATED_SINCE
                    : TransactionFilterParam.CREATED_UNTIL;

                updateFilters({ [filter]: value });
            }
        };

        return [
            _updateTextFilter(TransactionFilterParam.ACCOUNT_HOLDER),
            _updateTextFilter(TransactionFilterParam.BALANCE_ACCOUNT),
            _updateDateFilter
        ];
    }, [updateFilters]);

    useEffect(() => {
        onFilterChange?.(filters, elementRef);
    }, [filters, onFilterChange]);

    return <div className="adyen-fp-transactions">
        <div className="adyen-fp-title">{i18n.get('transactions')}</div>

        { !!onFilterChange &&
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
            </FilterBar> }

        <TransactionList
            loading={fetching}
            transactions={records}
            onAccountSelected={onAccountSelected}
            onBalanceAccountSelected={onBalanceAccountSelected}
            onTransactionSelected={onTransactionSelected}
            showPagination={true}
            {...paginationProps} />
    </div>;
}

export default Transactions;
