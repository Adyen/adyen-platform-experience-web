import { memo } from 'preact/compat';
import Select from '@src/components/internal/FormFields/Select';
import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';
import type { SelectProps } from '@src/components/internal/FormFields/Select/types';
import useMultiSelectionFilter from './useMultiSelectionFilter';

const MultiSelectionFilter = memo(
    <FilterParam extends string = string, FilterValue extends string = string>({
        placeholder,
        selection,
        selectionOptions,
        updateSelection,
    }: ReturnType<typeof useMultiSelectionFilter<FilterParam, FilterValue>> & Pick<SelectProps<any>, 'placeholder'>) => {
        const isSmViewport = useMediaQuery(mediaQueries.down.xs);

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
            />
        ) : null;
    }
);

export default MultiSelectionFilter;
