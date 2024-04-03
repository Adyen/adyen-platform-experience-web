import { memo } from 'preact/compat';
import Select from '@src/components/internal/FormFields/Select';
import type { SelectProps } from '@src/components/internal/FormFields/Select/types';
import useMultiSelectionFilter from './useMultiSelectionFilter';

const MultiSelectionFilter = memo(
    <FilterParam extends string = string, FilterValue extends string = string>({
        placeholder,
        selection,
        selectionOptions,
        updateSelection,
    }: ReturnType<typeof useMultiSelectionFilter<FilterParam, FilterValue>> & Pick<SelectProps<any>, 'placeholder'>) =>
        selectionOptions && selectionOptions.length > 1 ? (
            <Select
                onChange={updateSelection}
                filterable={false}
                multiSelect={true}
                placeholder={placeholder}
                selected={selection}
                withoutCollapseIndicator={true}
                items={selectionOptions}
            />
        ) : null
);

export default MultiSelectionFilter;
