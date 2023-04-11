import { useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
import FilterBar from '../../internal/FilterBar';
import Alert from '../../internal/Alert';
import TextFilter from '../../internal/FilterBar/filters/TextFilter';
import DateFilter from '../../internal/FilterBar/filters/DateFilter';
import { getCursor, getRequestParams } from './utils';
import TransactionList from './TransactionList';
import './Transactions.scss';
import { TransactionsPageProps } from '../types';
import { PageChangeOptions } from '../../internal/Pagination/type';

function Transactions(props: TransactionsPageProps) {
    const { i18n } = useCoreContext();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const defaultFilters = useMemo(() => getRequestParams(props.transactions), [props.transactions]);
    const [filters, setFilters] = useState(defaultFilters);
    const hasNextPage = useMemo(() => {
        return !!props.transactions?._links?.next;
    }, [props.transactions]);

    const handlePageChange = (dir: PageChangeOptions): void => {
        setLoading(true);
        const newPage = dir === 'prev' ? page - 1 : page + 1;
        setPage(newPage);
        const cursor = getCursor(dir, props.transactions);
        const newFilters = { ...filters, cursor: cursor ?? '' };
        setFilters(newFilters);
        if (cursor) props.onFilterChange?.({ filters: newFilters }, props.elementRef);
    };

    const handleFilterChange = (newFilter: { [p: string]: string }): void => {
        setLoading(true);
        const newFilters = { ...filters, ...newFilter };
        setFilters(newFilters);
        props.onFilterChange?.({ filters: newFilters }, props.elementRef);
        setPage(1);
    };

    const handleFilterReset = () => {
        setFilters({});
    };

    useEffect(() => {
        setLoading(false);
    }, [props.transactions]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-title">{i18n.get('transactions')}</div>
            {!!props.onFilterChange && (
                <FilterBar filters={filters} resetFilters={handleFilterReset}>
                    <TextFilter
                        label={i18n.get('balanceAccount')}
                        name={'balanceAccountId'}
                        classNameModifiers={['balanceAccount']}
                        value={filters?.balanceAccountId}
                        onChange={handleFilterChange}
                    />
                    <TextFilter
                        label={i18n.get('account')}
                        name={'accountHolderId'}
                        classNameModifiers={['account']}
                        value={filters?.accountHolderId}
                        onChange={handleFilterChange}
                    />
                    {filters?.createdSince && filters?.createdUntil && (
                        <DateFilter
                            label={i18n.get('createdSince')}
                            name={'createdSince'}
                            classNameModifiers={['createdSince']}
                            from={i18n.fullDate(filters.createdSince)}
                            to={i18n.fullDate(filters.createdUntil)}
                            onChange={handleFilterChange}
                        />
                    )}
                </FilterBar>
            )}

            {props.transactions?.data?.length ? (
                <TransactionList
                    loading={loading}
                    hasNextPage={hasNextPage}
                    transactions={props.transactions}
                    page={page}
                    onChange={handlePageChange}
                    onAccountSelected={props.onAccountSelected}
                    onBalanceAccountSelected={props.onBalanceAccountSelected}
                    onTransactionSelected={props.onTransactionSelected}
                    showPagination={!!props.onFilterChange}
                />
            ) : !filters?.balancePlatform && !filters?.balanceAccountId && !filters?.accountHolderId ? (
                <Alert type="info">{i18n.get('toStart')}</Alert>
            ) : (
                <Alert icon={'cross'}>{i18n.get('unableToLoadTransactions')}</Alert>
            )}
        </div>
    );
}

export default Transactions;
