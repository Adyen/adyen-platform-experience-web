import useReflex, { Nullable, Reflexable } from '@src/hooks/useReflex';
import { useCallback, useEffect, useRef } from 'preact/hooks';
const onFocusoutCapture = (e: Event) => {
    e.stopImmediatePropagation();
};
export const useClickOutside = <T extends Element = Element>(
    rootElementRef?: Nullable<Reflexable<T>>,
    callback?: (interactionKeyPressed: boolean) => void,
    disableClickOutside?: boolean
) => {
    const ref = useRef<Nullable<T>>(null);

    const handleClickOutside = useCallback(
        (e: Event) => {
            const eventPath: EventTarget[] = e.composedPath();
            if (!(ref && ref.current)) return;
            if (eventPath.length) {
                const samePath = eventPath.some(path => (path as T)?.isSameNode && (path as T).isSameNode(ref.current as T));
                if (callback && !samePath) {
                    callback(true);
                }
            }
        },
        [callback, ref]
    );

    const clickOutsideHandlerRef = useRef(handleClickOutside);

    useEffect(() => {
        document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        clickOutsideHandlerRef.current = handleClickOutside;
        document.addEventListener('click', clickOutsideHandlerRef.current, true);
        return () => document.removeEventListener('click', clickOutsideHandlerRef.current, true);
    }, [handleClickOutside]);

    useEffect(() => {
        if (disableClickOutside) {
            document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        } else {
            document.addEventListener('click', clickOutsideHandlerRef.current, true);
        }
    }, [disableClickOutside]);

    return useReflex<T>(
        useCallback(
            (current: Nullable<T>, previous) => {
                if (previous instanceof Element) {
                    previous.removeEventListener('focusout', onFocusoutCapture, true);
                }
                if (current instanceof Element) {
                    if (!disableClickOutside) {
                        current.addEventListener('focusout', onFocusoutCapture, true);
                        ref.current = current;
                    }
                }
            },
            [disableClickOutside]
        ),
        rootElementRef
    );
};
