import useReflex, { Nullable, Reflexable } from '@src/hooks/useReflex';
import { useCallback, useEffect, useRef } from 'preact/hooks';
export const useClickOutside = (rootElementRef: Nullable<Reflexable<Element>>, callback?: (interactionKeyPressed: boolean) => void) => {
    const ref = useRef<Nullable<Element>>(null);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            const eventPath: EventTarget[] = e.composedPath(); //Check if this only works with
            if (!(ref && ref.current)) return;
            if (eventPath.length) {
                const samePath = eventPath.some(path => (path as Element)?.isSameNode && (path as Element).isSameNode(ref.current as Element));
                if (callback && !samePath) {
                    callback(true);
                }
            }
        };
        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    }, [ref, callback]);

    return useReflex<Element>(
        useCallback((current: Nullable<Element>) => {
            ref.current = current;
        }, []),
        rootElementRef
    );
};
