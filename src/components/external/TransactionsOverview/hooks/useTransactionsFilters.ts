import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { TransactionsFilters, TransactionsView } from '../types';
import { compareTransactionsFilters } from '../components/utils';
import { INITIAL_FILTERS } from '../constants';

const INSIGHTS_FILTERS_SET = new Set<keyof TransactionsFilters>(['balanceAccount', 'createdDate']);

export interface UseTransactionsFiltersProps {
    activeView: TransactionsView;
}

const useTransactionsFilters = <T extends UseTransactionsFiltersProps>({ activeView }: T) => {
    const [lastFiltersChangeTimestamp, setLastFiltersChangeTimestamp] = useState(Date.now());
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const cachedInsightsFilters = useRef(filters);
    const cachedTransactionsFilters = useRef(filters);

    const { insightsFiltersChanged, transactionsFiltersChanged } = useMemo(() => {
        const hasActiveBalanceAccount = !!filters.balanceAccount?.id;
        const insightsFiltersChanged = compareTransactionsFilters(filters, cachedInsightsFilters.current, INSIGHTS_FILTERS_SET);
        const transactionsFiltersChanged = compareTransactionsFilters(filters, cachedTransactionsFilters.current);

        return {
            insightsFiltersChanged: hasActiveBalanceAccount && insightsFiltersChanged,
            transactionsFiltersChanged: hasActiveBalanceAccount && transactionsFiltersChanged,
        } as const;
    }, [filters]);

    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;
    const insightsFiltersPendingRefresh = !isTransactionsView && insightsFiltersChanged && cachedInsightsFilters.current !== filters;
    const transactionsFiltersPendingRefresh = isTransactionsView && transactionsFiltersChanged && cachedTransactionsFilters.current !== filters;

    const onFiltersChange = useCallback((filters: Readonly<TransactionsFilters>) => {
        setLastFiltersChangeTimestamp(Date.now());
        setFilters(filters);
    }, []);

    useEffect(() => {
        if (insightsFiltersPendingRefresh) {
            cachedInsightsFilters.current = filters;
        }
    }, [filters, insightsFiltersPendingRefresh]);

    useEffect(() => {
        if (transactionsFiltersPendingRefresh) {
            cachedTransactionsFilters.current = filters;
        }
    }, [filters, transactionsFiltersPendingRefresh]);

    return {
        filters,
        onFiltersChange,
        lastFiltersChangeTimestamp,
        insightsFiltersChanged,
        insightsFiltersPendingRefresh,
        transactionsFiltersChanged,
        transactionsFiltersPendingRefresh,
    } as const;
};

export default useTransactionsFilters;
