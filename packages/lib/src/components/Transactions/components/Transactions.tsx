import { useCallback, useEffect/*, useMemo, useState*/ } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
// import FilterBar from '../../internal/FilterBar';
import Alert from '../../internal/Alert';
// import TextFilter from '../../internal/FilterBar/filters/TextFilter';
// import DateFilter from '../../internal/FilterBar/filters/DateFilter';
// import { getCursor, getRequestParams } from './utils';
import TransactionList from './TransactionList';
import './Transactions.scss';
import { Transaction, TransactionsPageProps } from '../types';
import useBooleanState from '../../../hooks/useBooleanState';
import usePartialRecordSet, { PageNeighbours, PartialRecordSetPageNeighbours } from '../../../hooks/usePartialRecordSet';

const enum ReactiveParams {
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

type ReactiveTransactionParams = typeof ReactiveParams[keyof typeof ReactiveParams];

const fetchTransactionRecords = async (cursor?: string | null) => {
    const { host, protocol } = window.location;
    const url = new URL(`${protocol}//${host}/transactions`);
    cursor && url.searchParams.set('cursor', cursor);

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());

    if (response.error) throw 'Could not retrieve the list of transactions';

    const { data: records, _links: links } = (response as TransactionsPageProps['transactions']);

    if (links) {
        const neighbours = Object.fromEntries(Object.entries(links).map(([key, { href }]) => [key, new URL(href).searchParams]));
        return [records, neighbours] as [Transaction[], PartialRecordSetPageNeighbours];
    }

    throw 'Could not retrieve transactions metadata';
};

function Transactions(props: any) {
    const { i18n } = useCoreContext();
    const [ loading, updateLoading ] = useBooleanState(true);
    const fetchRecords = useCallback(fetchTransactionRecords, []);

    const { goto, hasNext, hasPrev, page, params, records } =
        usePartialRecordSet<Transaction, ReactiveTransactionParams>(fetchRecords, [
            ReactiveParams.CREATED_SINCE,
            ReactiveParams.CREATED_UNTIL
        ]);

    const handlePageChange = useCallback((dir: PageNeighbours) => {
        try {
            updateLoading(true);
            if (dir === PageNeighbours.NEXT && hasNext) {
                goto(page + 1);
                params[ReactiveParams.CREATED_UNTIL] = `${Math.random()}`;
            }
            else if (dir === PageNeighbours.PREV && hasPrev) {
                goto(page - 1);
                params[ReactiveParams.CREATED_SINCE] = `${Math.random()}`;
            }
        } catch (e) { console.error(e); }
    }, [goto, hasNext, hasPrev, page, updateLoading]);

    useEffect(() => {
        updateLoading(false);
    }, [records]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-title">{i18n.get('transactions')}</div>

            { records.length ? (
                <TransactionList
                    loading={loading}
                    hasNextPage={hasNext}
                    transactions={{ data: records }}
                    page={page}
                    onPageChange={handlePageChange}
                    onAccountSelected={props.onAccountSelected}
                    onBalanceAccountSelected={props.onBalanceAccountSelected}
                    onTransactionSelected={props.onTransactionSelected}
                    showPagination={true}
                />
            ) : <Alert icon={'cross'}>{i18n.get('unableToLoadTransactions')}</Alert> }
        </div>
    );
}

// function TransactionsOld(props: TransactionsPageProps) {
//     const { i18n } = useCoreContext();
//     const [page, setPage] = useState(1);
//     const [loading, setLoading] = useState(false);
//     const defaultFilters = useMemo(() => getRequestParams(props.transactions), [props.transactions]);
//     const [filters, setFilters] = useState(defaultFilters);
//     const hasNextPage = useMemo(() => {
//         return !!props.transactions?._links?.next;
//     }, [props.transactions]);
//
//     const handlePageChange = (dir: PageNeighbours): void => {
//         setLoading(true);
//         const newPage = dir === 'prev' ? page - 1 : page + 1;
//         setPage(newPage);
//         const cursor = getCursor(dir, props.transactions);
//         const newFilters = { ...filters, cursor: cursor ?? '' };
//         setFilters(newFilters);
//         if (cursor) props.onFilterChange?.({ filters: newFilters }, props.elementRef);
//     };
//
//     const handleFilterChange = (newFilter: { [p: string]: string }): void => {
//         setLoading(true);
//         const newFilters = { ...filters, ...newFilter };
//         setFilters(newFilters);
//         props.onFilterChange?.({ filters: newFilters }, props.elementRef);
//         setPage(1);
//     };
//
//     const handleFilterReset = () => {
//         if (filters !== defaultFilters) {
//             const emptyFilters = {};
//             setFilters(emptyFilters);
//             props.onFilterChange?.({ filters: emptyFilters }, props.elementRef);
//         }
//     };
//
//     useEffect(() => {
//         setLoading(false);
//     }, [props.transactions]);
//
//     return (
//         <div className="adyen-fp-transactions">
//             <div className="adyen-fp-title">{i18n.get('transactions')}</div>
//             {!!props.onFilterChange && (
//                 <FilterBar filters={filters} resetFilters={handleFilterReset}>
//                     <TextFilter
//                         label={i18n.get('balanceAccount')}
//                         name={'balanceAccountId'}
//                         classNameModifiers={['balanceAccount']}
//                         value={filters?.balanceAccountId}
//                         onChange={handleFilterChange}
//                     />
//                     <TextFilter
//                         label={i18n.get('account')}
//                         name={'accountHolderId'}
//                         classNameModifiers={['account']}
//                         value={filters?.accountHolderId}
//                         onChange={handleFilterChange}
//                     />
//                     <DateFilter
//                         label={i18n.get('dateRange')}
//                         name={'createdSince'}
//                         classNameModifiers={['createdSince']}
//                         from={filters?.createdSince ?? defaultFilters?.createdSince}
//                         to={filters?.createdUntil ?? defaultFilters?.createdUntil}
//                         onChange={handleFilterChange}
//                     />
//                 </FilterBar>
//             )}
//
//             {props.transactions?.data?.length ? (
//                 <TransactionList
//                     loading={loading}
//                     hasNextPage={hasNextPage}
//                     transactions={props.transactions}
//                     page={page}
//                     onPageChange={handlePageChange}
//                     onAccountSelected={props.onAccountSelected}
//                     onBalanceAccountSelected={props.onBalanceAccountSelected}
//                     onTransactionSelected={props.onTransactionSelected}
//                     showPagination={!!props.onFilterChange}
//                 />
//             ) : !filters?.balancePlatform && !filters?.balanceAccountId && !filters?.accountHolderId ? (
//                 <Alert type="info">{i18n.get('toStart')}</Alert>
//             ) : (
//                 <Alert icon={'cross'}>{i18n.get('unableToLoadTransactions')}</Alert>
//             )}
//         </div>
//     );
// }

export default Transactions;
