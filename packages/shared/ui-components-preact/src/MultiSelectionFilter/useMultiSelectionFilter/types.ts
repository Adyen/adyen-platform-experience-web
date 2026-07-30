export type SelectionOptionsList<T extends string = string> = readonly T[] | T[];

export type UseMultiSelectionFilterConfig<FilterParam extends string = string, FilterValue extends string = string> = {
    defaultFilters?: Readonly<Record<string, string | undefined>>;
    filterParam: FilterParam;
    filterValues?: SelectionOptionsList<FilterValue>;
    filters?: Readonly<Record<string, string | undefined>>;
    mapFilterOptionName?: (id: FilterValue) => string;
    updateFilters?: (update: Partial<Record<string, string | undefined>>) => void;
};

export type UseMultiSelectionFilterConfigWithoutValues<FilterParam extends string = string, FilterValue extends string = string> = Omit<
    UseMultiSelectionFilterConfig<FilterParam, FilterValue>,
    'filterValues'
>;
