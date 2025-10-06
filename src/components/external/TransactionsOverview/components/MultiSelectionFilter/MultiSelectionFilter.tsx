import { memo } from 'preact/compat';
import Select from '../../../../internal/FormFields/Select';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import type { SelectProps } from '../../../../internal/FormFields/Select/types';
import useMultiSelectionFilter from './useMultiSelectionFilter';

const MultiSelectionFilter = memo(
    <FilterParam extends string = string, FilterValue extends string = string>({
        placeholder,
        selection,
        selectionOptions,
        updateSelection,
        onResetAction,
    }: ReturnType<typeof useMultiSelectionFilter<FilterParam, FilterValue>> & Pick<SelectProps<any>, 'placeholder' | 'onResetAction'>) => {
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
        const isOnlySmContainer = useResponsiveContainer(containerQueries.only.sm);
        const isOnlyMdContainer = useResponsiveContainer(containerQueries.only.md);

        return selectionOptions && selectionOptions.length > 1 ? (
            <Select
                onResetAction={onResetAction}
                onChange={updateSelection}
                filterable={false}
                multiSelect={true}
                placeholder={placeholder}
                selected={selection}
                withoutCollapseIndicator={true}
                items={selectionOptions}
                showOverlay={isSmContainer}
                fitPosition={isOnlyMdContainer || isOnlySmContainer}
            />
        ) : null;
    }
);

export default MultiSelectionFilter;
