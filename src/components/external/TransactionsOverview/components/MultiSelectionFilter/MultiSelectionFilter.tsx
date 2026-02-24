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
        readonly,
        isInvalid,
    }: ReturnType<typeof useMultiSelectionFilter<FilterParam, FilterValue>> &
        Required<Pick<SelectProps<any>, 'placeholder'>> & { readonly?: boolean; isInvalid?: boolean; onResetAction?: () => void }) => {
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

        const canRenderSelector = (selectionOptions && selectionOptions.length > 1) || readonly;

        return (
            canRenderSelector && (
                <Select
                    readonly={readonly}
                    isInvalid={isInvalid}
                    onResetAction={onResetAction}
                    onChange={updateSelection}
                    filterable={false}
                    multiSelect={true}
                    placeholder={placeholder}
                    selected={selection}
                    withoutCollapseIndicator={true}
                    items={selectionOptions ?? []}
                    showOverlay={isSmContainer}
                    aria-label={placeholder}
                />
            )
        );
    }
);

export default MultiSelectionFilter;
