import { EMPTY_OBJECT } from '../../../../utils/common';
import { UsePaginatedRecordsFilters } from './types';
import useReactiveState from '../../../../hooks/useReactiveState';
import { ReactiveStateRecord } from '../../../../hooks/useReactiveState/types';

const usePaginatedRecordsFilters = <FilterValue, FilterParam extends string>(
    filterParams: ReactiveStateRecord<FilterValue, FilterParam> = EMPTY_OBJECT,
    initialFiltersSameAsDefault?: boolean
): UsePaginatedRecordsFilters<FilterValue, FilterParam> => {
    const {
        canResetState: canResetFilters,
        defaultState: defaultFilters,
        resetState: resetFilters,
        state: filters,
        updateState: updateFilters,
    } = useReactiveState<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    return { canResetFilters, defaultFilters, filters, resetFilters, updateFilters };
};

export default usePaginatedRecordsFilters;
