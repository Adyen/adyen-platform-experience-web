import { useMemo } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
import FilterBar from '../../internal/FilterBar';
import TextFilter from '../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import usePaginatedRecords, { PaginatedRecordsFetcherParams, WithPageNeighbours } from '../../../hooks/usePaginatedRecords';
import { Transaction, TransactionFilterParam, TransactionsPageProps } from '../types';
import { DateRangeFilterParam } from '../../internal/FilterBar/filters/DateFilter/types';
import './Transactions.scss';

const filterParams = [
    TransactionFilterParam.ACCOUNT_HOLDER,
    TransactionFilterParam.BALANCE_ACCOUNT,
    TransactionFilterParam.CREATED_SINCE,
    TransactionFilterParam.CREATED_UNTIL
];

const fetchRecords = async (signal: AbortSignal, params: PaginatedRecordsFetcherParams<TransactionFilterParam, string> = {}) => {
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
        return [records, neighbours] as [Transaction[], WithPageNeighbours];
    }

    throw 'Could not retrieve transactions metadata';
};

function Transactions(props: any) {
    const { i18n } = useCoreContext();
    const { canResetFilters, fetching, getFilter, hasNext, navigate, page, records, resetFilters, updateFilter } =
        usePaginatedRecords<Transaction, TransactionFilterParam>(fetchRecords, filterParams);

    const [
        updateAccountHolderFilter,
        updateBalanceAccountFilter,
        updateCreatedDateFilter
    ] = useMemo(() => {
        const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilter(param, value);
                    break;
            }
        };

        const _updateDateFilter = (params: {[P in DateRangeFilterParam]?: string} = {}) => {
            for (const [ param, value ] of Object.entries(params)) {
                const filter = param === DateRangeFilterParam.FROM
                    ? TransactionFilterParam.CREATED_SINCE
                    : TransactionFilterParam.CREATED_UNTIL;

                updateFilter(filter, value);
            }
        };

        return [
            _updateTextFilter(TransactionFilterParam.ACCOUNT_HOLDER),
            _updateTextFilter(TransactionFilterParam.BALANCE_ACCOUNT),
            _updateDateFilter
        ];
    }, [updateFilter]);

    // useEffect(() => {
    //     props?.onFilterChange({ ...filters }, props.elementRef);
    // }, [props?.onFilterChange, props.elementRef]);

    return <div className="adyen-fp-transactions">
        <div className="adyen-fp-title">{i18n.get('transactions')}</div>

        { !!props.onFilterChange &&
            <FilterBar canResetFilters={canResetFilters} resetFilters={resetFilters}>
                <TextFilter
                    classNameModifiers={['balanceAccount']}
                    label={i18n.get('balanceAccount')}
                    name={TransactionFilterParam.BALANCE_ACCOUNT}
                    value={getFilter(TransactionFilterParam.BALANCE_ACCOUNT)}
                    onChange={updateBalanceAccountFilter}
                />
                <TextFilter
                    classNameModifiers={['account']}
                    label={i18n.get('account')}
                    name={TransactionFilterParam.ACCOUNT_HOLDER}
                    value={getFilter(TransactionFilterParam.ACCOUNT_HOLDER)}
                    onChange={updateAccountHolderFilter}
                />
                <DateFilter
                    classNameModifiers={['createdSince']}
                    label={i18n.get('dateRange')}
                    name={TransactionFilterParam.CREATED_SINCE}
                    from={getFilter(TransactionFilterParam.CREATED_SINCE)}
                    to={getFilter(TransactionFilterParam.CREATED_UNTIL)}
                    onChange={updateCreatedDateFilter}
                />
            </FilterBar> }

        <TransactionList
            loading={fetching}
            hasNextPage={hasNext}
            transactions={records}
            page={page}
            onPageChange={navigate}
            onAccountSelected={props.onAccountSelected}
            onBalanceAccountSelected={props.onBalanceAccountSelected}
            onTransactionSelected={props.onTransactionSelected}
            showPagination={true} />
    </div>;
}

export default Transactions;
