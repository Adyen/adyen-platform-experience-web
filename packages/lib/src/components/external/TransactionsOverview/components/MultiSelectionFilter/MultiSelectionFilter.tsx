import { memo } from 'preact/compat';
import Select from '../../../../internal/FormFields/Select';
import { mediaQueries, useMediaQuery } from '../../hooks/useMediaQuery';
import type { SelectProps } from '../../../../internal/FormFields/Select/types';
import useMultiSelectionFilter from './useMultiSelectionFilter';

const MultiSelectionFilter = memo(
    <FilterParam extends string = string, FilterValue extends string = string>({
        placeholder,
        selection,
        selectionOptions,
        updateSelection,
    }: ReturnType<typeof useMultiSelectionFilter<FilterParam, FilterValue>> & Pick<SelectProps<any>, 'placeholder'>) => {
        const isSmViewport = useMediaQuery(mediaQueries.down.xs);
        const isOnlySmDevice = useMediaQuery(mediaQueries.only.sm);
        const isOnlyMdDevice = useMediaQuery(mediaQueries.only.md);

        return selectionOptions && selectionOptions.length > 1 ? (
            <Select
                onChange={updateSelection}
                filterable={false}
                multiSelect={true}
                placeholder={placeholder}
                selected={selection}
                withoutCollapseIndicator={true}
                items={selectionOptions}
                showOverlay={isSmViewport}
                fitPosition={isOnlyMdDevice || isOnlySmDevice}
            />
        ) : null;
    }
);

export default MultiSelectionFilter;
