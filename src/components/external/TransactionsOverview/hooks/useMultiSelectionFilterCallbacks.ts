import { useCallback } from 'preact/hooks';
import { FilterType } from '../../../../core/Analytics/analytics/user-events';
import useFilterEvent from './useFilterEvent';

export interface UseMultiSelectionFilterCallbacksProps<T extends string> {
    eventCategory?: string;
    eventLabel?: FilterType;
    onResetFilter?: () => void;
    onUpdateFilter?: (selection: readonly T[]) => void;
}

const useMultiSelectionFilterCallbacks = <T extends string>({
    eventCategory,
    eventLabel,
    onResetFilter,
    onUpdateFilter,
}: UseMultiSelectionFilterCallbacksProps<T>) => {
    const { logEvent } = useFilterEvent({ category: eventCategory, label: eventLabel });

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

    return { onResetSelection, onUpdateSelection } as const;
};

export default useMultiSelectionFilterCallbacks;
