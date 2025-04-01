import { Ref } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { Reflexable } from '../../primitives/reactive/reflex';
import { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

const FOCUS_EVENTS = ['focus', 'blur'] as const;

export const useFocusVisibility = <Elem extends HTMLElement>(elementRef?: Nullable<Reflexable<Elem>>) => {
    const [hasFocus, setHasFocus] = useState(false);
    const [hasVisibleFocus, setHasVisibleFocus] = useState(false);

    const updateFocusVisibility = useCallback((event: FocusEvent) => {
        const element = event.target as HTMLElement;
        setHasFocus(!!element?.matches(':focus'));
        setHasVisibleFocus(!!element?.matches(':focus-visible'));
    }, []);

    const ref: Ref<Elem> = useReflex<Elem>(
        useCallback(
            (current, previous) => {
                if (previous instanceof HTMLElement) {
                    FOCUS_EVENTS.forEach(event => {
                        previous.removeEventListener(event, updateFocusVisibility, false);
                    });
                }
                if (current instanceof HTMLElement) {
                    FOCUS_EVENTS.forEach(event => {
                        current.addEventListener(event, updateFocusVisibility, false);
                    });
                }
            },
            [elementRef, updateFocusVisibility]
        ),
        elementRef
    );

    return { hasFocus, hasVisibleFocus, ref } as const;
};

export default useFocusVisibility;
