import useReflex, { Nullable, Reflexable } from '@src/hooks/useReflex';
import { useCallback, useEffect, useRef } from 'preact/hooks';
const onFocusoutCapture = (e: Event) => {
    e.stopImmediatePropagation();
};
export const useClickOutside = (rootElementRef: Nullable<Reflexable<Element>>, callback?: (interactionKeyPressed: boolean) => void) => {
    const ref = useRef<Nullable<Element>>(null);

    const handleClickOutside = useCallback(
        (e: Event) => {
            const eventPath: EventTarget[] = e.composedPath();
            if (!(ref && ref.current)) return;
            if (eventPath.length) {
                const samePath = eventPath.some(path => (path as Element)?.isSameNode && (path as Element).isSameNode(ref.current as Element));
                if (callback && !samePath) {
                    callback(true);
                }
            }
        },
        [callback]
    );

    const clickOutsideHandlerRef = useRef(handleClickOutside);

    useEffect(() => {
        document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        clickOutsideHandlerRef.current = handleClickOutside;
        document.addEventListener('click', clickOutsideHandlerRef.current, true);
        return () => document.removeEventListener('click', clickOutsideHandlerRef.current, true);
    }, [handleClickOutside]);

    return useReflex<Element>(
        useCallback((current: Nullable<Element>, previous) => {
            if (previous instanceof Element) {
                previous.removeEventListener('focusout', onFocusoutCapture, true);
            }
            if (current instanceof Element) {
                current.addEventListener('focusout', onFocusoutCapture, true);
            }
            ref.current = current;
        }, []),
        rootElementRef
    );
};
