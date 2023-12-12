import { useCallback, useRef } from 'preact/hooks';
import useListBoxListeners from './useListBoxListeners';
import useListBoxPrimitives from './useListBoxPrimitives';

const useListBox = <T extends any = any>(options: T[], selectedOption?: T) => {
    const { dispatch, state, ...primitives } = useListBoxPrimitives<T>(options, selectedOption);
    const focusRestorationTarget = useRef<HTMLElement | null>(null);
    const listeners = useListBoxListeners({ ...primitives, dispatch, focusRestorationTarget, state });

    const expand = useCallback(
        (expanded: boolean, focusRestorationElem?: HTMLElement) => {
            dispatch({ type: 'EXPAND', arg: expanded });
            if (state.expanded || !expanded) return;
            focusRestorationTarget.current = focusRestorationElem ?? (document.activeElement as HTMLElement);
        },
        [dispatch, state]
    );

    return { expand, listeners, state, ...primitives } as const;
};

export default useListBox;
