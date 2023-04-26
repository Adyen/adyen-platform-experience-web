import { UsePaginatedRecordsFilters } from './types';
import useReactiveStateWithParams from '../../../../hooks/useReactiveStateWithParams';

const usePaginatedRecordsFilters = <FilterValue, FilterParam extends string>(
    filterParams: FilterParam[] = [],
    isDefaultState?: boolean
): UsePaginatedRecordsFilters<FilterValue, FilterParam> => {
    const {
        canResetState: canResetFilters,
        defaultState: defaultFilters,
        resetState: resetFilters,
        state: filters,
        updateState: updateFilters
    } = useReactiveStateWithParams<FilterValue>(filterParams, isDefaultState);

    return { canResetFilters, defaultFilters, filters, resetFilters, updateFilters };
};

export default usePaginatedRecordsFilters;
