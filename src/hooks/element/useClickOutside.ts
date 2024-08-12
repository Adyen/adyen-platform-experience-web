import { useCallback, useEffect, useRef } from 'preact/hooks';
import { popoverUtil } from '../../components/internal/Popover/utils/popoverUtil';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

export const CONTROL_ELEMENT_PROPERTY: unique symbol = Symbol('__control.Elem.');

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
                let eventPathIndex = 0;
                let samePath = false;
                let currentElement: Element | null = eventPath[eventPathIndex] as Element;

                while (currentElement instanceof Element) {
                    if ((samePath ||= currentElement?.isSameNode(ref.current))) break;
                    currentElement = (eventPath[++eventPathIndex] as Element) ?? currentElement.parentElement;

                    if ((currentElement as any)?.[CONTROL_ELEMENT_PROPERTY] instanceof Element) {
                        currentElement = (currentElement as any)[CONTROL_ELEMENT_PROPERTY];
                        eventPath.length = 0;
                    }
                }

                if (callback && !samePath) callback(true);
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
