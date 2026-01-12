import { useCallback, useMemo, useState } from 'preact/hooks';
import { listFrom } from '../../../../../../../utils';
import { selectionOptionsFor } from './utils';
import type { SelectionOptionsList, UseMultiSelectionFilterConfig, UseMultiSelectionFilterConfigWithoutValues } from './types';
import type { SelectChangeEvent } from '../../../../../../internal/FormFields/Select/types';

export const useMultiSelectionFilter = <FilterParam extends string = string, FilterValue extends string = string>({
    filterParam,
    filterValues,
    filters,
    defaultFilters,
    updateFilters,
    mapFilterOptionName,
}: UseMultiSelectionFilterConfig<FilterParam, FilterValue>) => {
    const selection = useMemo(() => {
        return listFrom<FilterValue>(filters?.[filterParam] ?? defaultFilters?.[filterParam] ?? '');
    }, [defaultFilters, filters, filterParam]);

    const selectionOptions = useMemo(
        () => filterValues && selectionOptionsFor(filterValues, mapFilterOptionName),
        [filterValues, mapFilterOptionName]
    );

    const updateSelection = useCallback(
        ({ target }: SelectChangeEvent) => {
            updateFilters?.({ [filterParam]: target?.value || '' });
        },
        [updateFilters, filterParam]
    );

    return { selection, selectionOptions, updateSelection } as const;
};

export const useMultiSelectionFilterWithoutValues = <FilterParam extends string = string, FilterValue extends string = string>(
    config: UseMultiSelectionFilterConfigWithoutValues<FilterParam, FilterValue>
) => {
    const [filterValues, updateFilterValues] = useState<SelectionOptionsList<FilterValue>>();
    const useMultiSelectionFilterProperties = useMultiSelectionFilter({ ...config, filterValues });

    return { ...useMultiSelectionFilterProperties, filterValues, updateFilterValues } as const;
};

export default useMultiSelectionFilter;
