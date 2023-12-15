import { EMPTY_OBJECT } from '@src/utils/common';
import { UsePaginatedRecordsFilters } from './types';
import useReactiveStateWithParams from '@src/hooks/useReactiveStateWithParams';
import { ReactiveStateRecord } from '@src/hooks/useReactiveStateWithParams/types';

const usePaginatedRecordsFilters = <FilterValue, FilterParam extends string>(
    filterParams: ReactiveStateRecord<FilterValue, FilterParam> = EMPTY_OBJECT,
    initialFiltersSameAsDefault?: boolean
): UsePaginatedRecordsFilters<FilterValue, FilterParam> => {
    const {
        canResetState: canResetFilters,
        defaultState: defaultFilters,
        resetState: resetFilters,
        state: filters,
        stateVersion: filtersVersion,
        updateState: updateFilters,
    } = useReactiveStateWithParams<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    return { canResetFilters, defaultFilters, filters, filtersVersion, resetFilters, updateFilters };
};

export default usePaginatedRecordsFilters;
