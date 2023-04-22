import { UsePaginatedRecordsFilters } from './types';
import useReactiveStateWithParams from '../../../../hooks/useReactiveStateWithParams';

const usePaginatedRecordsFilters = <FilterValue extends any, FilterParam extends string>(
    filterParams: FilterParam[] = []
): UsePaginatedRecordsFilters<FilterValue, FilterParam> => {
    const {
        canResetState: canResetFilters,
        defaultState: defaultFilters,
        resetState: resetFilters,
        state: filters,
        updateState: updateFilters
    } = useReactiveStateWithParams<FilterValue>(filterParams);

    return { canResetFilters, defaultFilters, filters, resetFilters, updateFilters };
};

export default usePaginatedRecordsFilters;
