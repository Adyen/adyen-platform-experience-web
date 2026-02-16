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
                let currentElement: Element | ShadowRoot | null = eventPath[eventPathIndex] as Element | ShadowRoot;

                while (currentElement instanceof Element || currentElement instanceof ShadowRoot) {
                    if (currentElement instanceof ShadowRoot) {
                        currentElement = currentElement.host;
                    }

                    if ((samePath ||= currentElement.isSameNode(ref.current))) break;

                    if ((currentElement as any)?.[CONTROL_ELEMENT_PROPERTY] instanceof Element) {
                        currentElement = (currentElement as any)[CONTROL_ELEMENT_PROPERTY];
                        eventPath.length = 0;
                        continue;
                    }

                    const nextInPath = eventPath[++eventPathIndex] as Element | ShadowRoot | undefined;
                    if (nextInPath) {
                        currentElement = nextInPath;
                    } else {
                        if (currentElement.parentElement) {
                            currentElement = currentElement.parentElement;
                        } else if (currentElement.parentNode instanceof ShadowRoot) {
                            currentElement = currentElement.parentNode;
                        } else {
                            currentElement = null;
                        }
                    }
                }

                if (callback && !samePath) callback(true);
            }
        },
        [ref, callback, variant]
    );

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (ref.current) {
            mouseDownInsideRef.current = e.composedPath().includes(ref.current);
        }
    }, []);

    const handleClick = useCallback(
        (e: MouseEvent) => {
            if (mouseDownInsideRef.current) {
                mouseDownInsideRef.current = false;
            } else handleClickOutside(e);
        },
        [handleClickOutside]
    );

    useEffect(() => {
        if (disableClickOutside || !ref.current) return;

        const element = ref.current;
        const target = element.getRootNode();

        if (target instanceof ShadowRoot || target instanceof Document) {
            target.addEventListener('mousedown', handleMouseDown as EventListener, true);
            target.addEventListener('click', handleClick as EventListener, true);

            if (variant === ClickOutsideVariant.POPOVER) {
                popoverUtil.add(element, callback);
            }

            return () => {
                target.removeEventListener('mousedown', handleMouseDown as EventListener, true);
                target.removeEventListener('click', handleClick as EventListener, true);

                if (variant === ClickOutsideVariant.POPOVER) {
                    popoverUtil.remove(element);
                }
            };
        }
    }, [disableClickOutside, variant, handleMouseDown, handleClick, callback]);

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
                } else {
                    ref.current = null;
                }
            },
            [disableClickOutside]
        ),
        rootElementRef
    );
};
