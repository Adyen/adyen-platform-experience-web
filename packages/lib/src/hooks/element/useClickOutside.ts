import { popoverUtil } from '@src/components/internal/Popover/utils/popoverUtil';
import useReflex, { Nullable, Reflexable } from '@src/hooks/useReflex';
import { useCallback, useEffect, useRef } from 'preact/hooks';

export const enum ClickOutsideVariant {
    POPOVER = 'POPOVER',
    DEFAULT = 'DEFAULT',
}
const onFocusoutCapture = (e: Event) => {
    e.stopImmediatePropagation();
};
export const useClickOutside = <T extends Element = Element>(
    rootElementRef?: Nullable<Reflexable<T>>,
    callback?: (interactionKeyPressed: boolean) => void,
    disableClickOutside?: boolean,
    variant?: ClickOutsideVariant
) => {
    const ref = useRef<Nullable<T>>(null);

    const handleClickOutside = useCallback(
        (e: Event) => {
            const eventPath: EventTarget[] = e.composedPath();
            if (!(ref && ref.current)) return;
            if (variant === ClickOutsideVariant.POPOVER) {
                popoverUtil.closePopoversOutsideOfClick(eventPath);
            } else {
                if (eventPath.length) {
                    const samePath = eventPath.some(path => (path as T)?.isSameNode && (path as T).isSameNode(ref.current as T));
                    if (callback && !samePath) {
                        callback(true);
                    }
                }
            }
        },
        [ref, callback, variant]
    );

    const clickOutsideHandlerRef = useRef(handleClickOutside);

    useEffect(() => {
        return () => {
            if (ref.current) popoverUtil.remove(ref.current);
            document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        };
    }, []);

    useEffect(() => {
        document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        clickOutsideHandlerRef.current = handleClickOutside;
        document.addEventListener('click', clickOutsideHandlerRef.current, true);
        if (variant === ClickOutsideVariant.POPOVER) {
            if (ref.current instanceof Element) popoverUtil.add(ref.current, callback);
        }
        return () => {
            if (ref.current) popoverUtil.remove(ref.current);
            document.removeEventListener('click', clickOutsideHandlerRef.current, true);
        };
    }, [handleClickOutside, callback, variant]);

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
            [disableClickOutside, variant]
        ),
        rootElementRef
    );
};
