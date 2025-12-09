import { listFrom } from '../utils';
import { useCallback } from 'preact/hooks';
import { FilterType } from '../core/Analytics/analytics/user-events';
import { SelectItem } from '../components/internal/FormFields/Select/types';
import useFilterAnalyticsEvent from './useAnalytics/useFilterAnalyticsEvent';

export interface UseMultiSelectionFilterPropsConfig<T extends string> {
    eventCategory?: string;
    eventLabel?: FilterType;
    onResetFilter?: () => void;
    onUpdateFilter?: (selection: readonly T[]) => void;
    selectionOptions: readonly SelectItem<T>[];
    selection: readonly T[];
}

const useMultiSelectionFilterProps = <T extends string>({
    eventCategory,
    eventLabel,
    onResetFilter,
    onUpdateFilter,
    selectionOptions,
    selection,
}: UseMultiSelectionFilterPropsConfig<T>) => {
    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, label: eventLabel });

    const onResetAction = useCallback(() => {
        // The reset action clears every existing selection (deselects every option).
        // If there is no existing selection (nothing is selected), the reset action
        // is a no-op operation since it does not alter the selection state.
        if (selection.length > 0) {
            // Since there was at least one existing selection before this reset,
            // trigger the reset action callback (if available)
            logEvent?.('reset');
            onResetFilter?.();
        }
    }, [selection, logEvent, onResetFilter]);

    const updateSelection = useCallback(
        ({ target }: { target?: { value: string } }) => {
            const nextSelection = new Set<T>(listFrom(target?.value || ''));
            const hasDeletions = selection.some(option => !nextSelection.has(option));
            const selectionChanged = hasDeletions || selection.length !== nextSelection.size;

            if (selectionChanged) {
                const sortedSelection = Object.freeze([...nextSelection].sort((a, b) => a.localeCompare(b)));
                logEvent?.('update', String(sortedSelection));
                onUpdateFilter?.(sortedSelection);
            }
        },
        [selection, logEvent, onUpdateFilter]
    );

    return { selection, selectionOptions, onResetAction, updateSelection };
};

export default useMultiSelectionFilterProps;
