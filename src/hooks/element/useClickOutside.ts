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

const onFocusout = (e: Event) => e.stopImmediatePropagation();

export const useClickOutside = <T extends Element = Element>(
    rootElementRef?: Nullable<Reflexable<T>>,
    callback?: (interactionKeyPressed: boolean) => void,
    disableClickOutside?: boolean,
    variant?: ClickOutsideVariant
) => {
    const ref = useRef<Nullable<T>>(null);
    const mouseDownInsideRef = useRef(false);

    const handleClickOutside = useCallback(
        (e: Event) => {
            if (!(ref && ref.current)) return;

            const eventPath: EventTarget[] = e.composedPath();

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

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (!(ref && ref.current)) return;
            mouseDownInsideRef.current = ref.current.contains(e.target as Node);
        },
        [ref]
    );

    const handleClick = useCallback(
        (e: MouseEvent) => {
            if (mouseDownInsideRef.current) {
                mouseDownInsideRef.current = false;
                return;
            }
            handleClickOutside(e);
        },
        [handleClickOutside]
    );

    useEffect(() => {
        if (disableClickOutside) return;

        document.addEventListener('mousedown', handleMouseDown, true);
        document.addEventListener('click', handleClick, true);

        if (variant === ClickOutsideVariant.POPOVER && ref.current instanceof Element) {
            popoverUtil.add(ref.current, callback);
        }

        return () => {
            document.removeEventListener('mousedown', handleMouseDown, true);
            document.removeEventListener('click', handleClick, true);
            if (ref.current) popoverUtil.remove(ref.current);
        };
    }, [disableClickOutside, handleMouseDown, handleClick, callback, variant, ref]);

    return useReflex<T>(
        useCallback(
            (current: Nullable<T>, previous) => {
                if (previous instanceof Element) {
                    previous.removeEventListener('focusout', onFocusout, false);
                }
                if (current instanceof Element) {
                    if (!disableClickOutside) {
                        current.addEventListener('focusout', onFocusout, false);
                        ref.current = current;
                    }
                }
            },
            [disableClickOutside, variant]
        ),
        rootElementRef
    );
};
