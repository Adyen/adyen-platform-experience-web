import { RefCallback, RefObject } from 'preact';
import { MutableRefObject } from 'preact/compat';
import { MutableRef, useCallback, useMemo, useRef } from 'preact/hooks';
import { NamedRef } from './types';
import { InteractionKeyCode } from '../../components/types';
import withTabbableRoot, { focusIsWithin, isFocusable } from './internal/tabbable';
import useRefWithCallback from './useRefWithCallback';

type TrackingRef = RefCallback<Element> | RefObject<Element> | MutableRef<Element | null> | MutableRefObject<Element | null>;

const useFocusTrapElementRef = (trackingRef: TrackingRef | null) => {
    const focusElement = useRef<Element | null>(null);
    const interactionKeyPressed = useRef(false);
    const tabbableRoot = useMemo(withTabbableRoot, []);

    const onClickCapture = useMemo(() => {
        let lastFocusableElement: Element | null = null;
        let raf: number | undefined;

        return (evt: Event) => {
            if (raf !== undefined) cancelAnimationFrame(raf);
            let element = evt.target as Element | null;

            while (element && element !== evt.currentTarget) {
                if (isFocusable(element)) {
                    lastFocusableElement = element;
                    raf = requestAnimationFrame(() => {
                        raf = requestAnimationFrame(() => {
                            if (focusElement.current !== lastFocusableElement && lastFocusableElement instanceof HTMLElement) {
                                (focusElement.current = lastFocusableElement)?.focus();
                            }
                            lastFocusableElement = null;
                            raf = undefined;
                        });
                    });
                    break;
                }
                element = element.parentNode as Element | null;
            }
        };
    }, []);

    const onFocusInCapture = useCallback((evt: FocusEvent) => {
        tabbableRoot.current = focusElement.current = evt.target as Element | null;
    }, []);

    const onFocusOutCapture = useCallback((evt: FocusEvent) => {
        if (tabbableRoot.tabbables.includes(evt.relatedTarget as Element)) return;
        if (focusIsWithin(evt.currentTarget as Element, evt.relatedTarget as Element | null)) return;
        if (!interactionKeyPressed.current) {
            /* [TODO]: trigger onEscapeFocusTrap callback */
        }
    }, []);

    const onKeyDownCapture = useMemo(() => {
        let raf: number | undefined;

        const resetKeyboardActivity = () => {
            interactionKeyPressed.current = false;
            raf = undefined;
        };

        return (evt: KeyboardEvent) => {
            cancelAnimationFrame(raf as number);
            resetKeyboardActivity();

            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                case InteractionKeyCode.END:
                case InteractionKeyCode.ESCAPE:
                case InteractionKeyCode.HOME:
                case InteractionKeyCode.PAGE_DOWN:
                case InteractionKeyCode.PAGE_UP:
                case InteractionKeyCode.TAB:
                    raf = requestAnimationFrame(resetKeyboardActivity);
                    interactionKeyPressed.current = true;
                    break;
            }

            if (evt.code === InteractionKeyCode.ESCAPE) {
                // [TODO]: Restore focus to the last focused element before the focus trap
            } else if (evt.code === InteractionKeyCode.TAB) {
                evt.preventDefault();
                tabbableRoot.current = evt.shiftKey ? -1 : 1;
            }
        };
    }, []);

    const focusTrapRef = useRefWithCallback<Element>(
        useCallback((current, previous) => {
            if (previous instanceof Element) {
                (previous as HTMLElement).removeEventListener('keydown', onKeyDownCapture, true);
                (previous as HTMLElement).removeEventListener('focusin', onFocusInCapture, true);
                (previous as HTMLElement).removeEventListener('focusout', onFocusOutCapture, true);
                previous.removeEventListener('click', onClickCapture, true);
            }

            if (current instanceof Element) {
                (current as HTMLElement).addEventListener('keydown', onKeyDownCapture, true);
                (current as HTMLElement).addEventListener('focusin', onFocusInCapture, true);
                (current as HTMLElement).addEventListener('focusout', onFocusOutCapture, true);
                current.addEventListener('click', onClickCapture, true);
                tabbableRoot.root = current;
            } else tabbableRoot.root = null;
        }, [])
    );

    return useMemo(() => {
        if (trackingRef === null) return focusTrapRef;
        let cachedCurrent: Element | null;

        return Object.defineProperty(
            typeof trackingRef === 'function'
                ? (current: Element | null) => {
                      trackingRef((cachedCurrent = current));
                      focusTrapRef?.(current);
                  }
                : (current: Element | null) => {
                      trackingRef.current = cachedCurrent = current;
                      focusTrapRef?.(current);
                  },
            'current',
            { get: () => cachedCurrent }
        ) as NamedRef<Element>;
    }, [focusTrapRef, trackingRef]);
};

export default useFocusTrapElementRef;
