import { UsePaginatedRecordsFilters } from './types';
import useReactiveStateWithParams from '../../../../hooks/useReactiveStateWithParams';

const usePaginatedRecordsFilters = <FilterValue, FilterParam extends string>(
    filterParams: FilterParam[] = [],
    initialFiltersSameAsDefault?: boolean
): UsePaginatedRecordsFilters<FilterValue, FilterParam> => {
    const {
        canResetState: canResetFilters,
        defaultState: defaultFilters,
        resetState: resetFilters,
        state: filters,
        stateVersion: filtersVersion,
        updateState: updateFilters,
    } = useReactiveStateWithParams<FilterValue>(filterParams, initialFiltersSameAsDefault);

    return { canResetFilters, defaultFilters, filters, filtersVersion, resetFilters, updateFilters };
};

export default usePaginatedRecordsFilters;
