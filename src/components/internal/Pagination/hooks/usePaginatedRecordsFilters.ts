import { EMPTY_OBJECT } from '../../../../utils';
import { UsePaginatedRecordsFilters } from './types';
import useReactiveState from '../../../../hooks/useReactiveState';
import { ReactiveStateRecord } from '../../../../hooks/useReactiveState/types';

const usePaginatedRecordsFilters = <FilterValue, FilterParam extends string>(
    filterParams: ReactiveStateRecord<FilterValue, FilterParam> = EMPTY_OBJECT as ReactiveStateRecord<FilterValue, FilterParam>,
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
