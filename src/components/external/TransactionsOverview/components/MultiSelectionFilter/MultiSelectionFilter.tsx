import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import Select from '../../../../internal/FormFields/Select';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import type { SelectProps } from '../../../../internal/FormFields/Select/types';
import type { TranslationKey } from '../../../../../translations';
import useMultiSelectionFilter from './useMultiSelectionFilter';

export type MultiSelectionFilterProps<FilterParam extends string = string, FilterValue extends string = string> = ReturnType<
    typeof useMultiSelectionFilter<FilterParam, FilterValue>
> &
    Required<Pick<SelectProps<any>, 'placeholder'>> & {
        allSelectionStatusKey: TranslationKey;
        partialSelectionStatusKey: TranslationKey;
    };

const MultiSelectionFilter = memo(
    <FilterParam extends string = string, FilterValue extends string = string>({
        allSelectionStatusKey,
        partialSelectionStatusKey,
        placeholder,
        selection,
        selectionOptions,
        updateSelection,
    }: MultiSelectionFilterProps<FilterParam, FilterValue>) => {
        const { i18n } = useCoreContext();
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
        const isOnlySmContainer = useResponsiveContainer(containerQueries.only.sm);
        const isOnlyMdContainer = useResponsiveContainer(containerQueries.only.md);

        const canRenderSelector = selectionOptions && selectionOptions.length > 1;
        const listFormatter = useMemo(() => new Intl.ListFormat(i18n.locale, { type: 'conjunction' }), [i18n.locale]);

        return (
            <>
                {canRenderSelector && (
                    <Select
                        onChange={updateSelection}
                        filterable={false}
                        multiSelect={true}
                        placeholder={placeholder}
                        selected={selection}
                        withoutCollapseIndicator={true}
                        items={selectionOptions}
                        showOverlay={isSmContainer}
                        fitPosition={isOnlyMdContainer || isOnlySmContainer}
                        aria-label={placeholder}
                    />
                )}

                <div aria-label={placeholder} className="adyen-pe-visually-hidden" role="status">
                    {i18n.get(
                        selection.length === 0 || selection.length === selectionOptions?.length ? allSelectionStatusKey : partialSelectionStatusKey,
                        { values: { count: selection.length, list: listFormatter.format(selection) } }
                    )}
                </div>
            </>
        );
    }
);

export default MultiSelectionFilter;
