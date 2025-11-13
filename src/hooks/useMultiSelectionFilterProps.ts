import { listFrom } from '../utils';
import { useCallback } from 'preact/hooks';
import { FilterType } from '../core/Analytics/analytics/user-events';
import { SelectItem } from '../components/internal/FormFields/Select/types';
import useFilterAnalyticsEvent from './analytics/useFilterAnalyticsEvent';

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

    const onResetSelection = useCallback(() => {
        logEvent?.('reset');
        onResetFilter?.();
    }, [logEvent, onResetFilter]);

    const onUpdateSelection = useCallback(
        (selection: readonly T[]) => {
            logEvent?.('update', String(selection));
            onUpdateFilter?.(selection);
        },
        [logEvent, onUpdateFilter]
    );

    const onResetAction = useCallback(() => {
        // The reset action clears every existing selection (deselects every option).
        // If there is no existing selection (nothing is selected), the reset action
        // is a no-op operation since it does not alter the selection state.
        if (selection.length > 0) {
            // Since there was at least one existing selection before this reset,
            // trigger the reset action callback (if available)
            onResetSelection?.();
        }
    }, [selection, onResetSelection]);

    const updateSelection = useCallback(
        ({ target }: { target?: any }) => {
            const nextSelection = new Set<T>(listFrom(target?.value || ''));
            const hasDeletions = selection.some(option => !nextSelection.has(option));
            const selectionChanged = hasDeletions || selection.length !== nextSelection.size;

            if (selectionChanged) {
                const sortedSelection = Object.freeze([...nextSelection].sort((a, b) => a.localeCompare(b)));
                onUpdateSelection?.(sortedSelection);
            }
        },
        [selection, onUpdateSelection]
    );

    // [TODO]: Fix issue to avoid cloning selection array
    // return { selection, selectionOptions, onResetAction, updateSelection } as const;
    return { selection: [...selection], selectionOptions, onResetAction, updateSelection };
};

export default useMultiSelectionFilterProps;
