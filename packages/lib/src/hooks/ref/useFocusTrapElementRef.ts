import { RefCallback, RefObject } from 'preact';
import { MutableRefObject } from 'preact/compat';
import { MutableRef, useCallback, useMemo, useRef } from 'preact/hooks';
import { NamedRef } from './types';
import { InteractionKeyCode } from '../../components/types';
import withTabbableRoot, { isFocusable } from './internal/tabbable';
import useRefWithCallback from './useRefWithCallback';

type TrackingRef = RefCallback<Element> | RefObject<Element> | MutableRef<Element | null> | MutableRefObject<Element | null>;

const useFocusTrapElementRef = (trackingRef: TrackingRef | null) => {
    const focusShift = useRef(0);
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
        focusElement.current = evt.target as Element | null;
    }, []);

    const onFocusOutCapture = useCallback((evt: FocusEvent) => {
        if (tabbableRoot.tabbables.includes(evt.relatedTarget as Element)) return;

        let parentElement = (evt.relatedTarget as Element | null)?.parentNode as Element | null;

        while (parentElement) {
            if (parent === evt.currentTarget) return;
            parentElement = parentElement?.parentNode as Element | null;
        }

        // [TODO]: trigger onEscapeFocusTrap() callback
    }, []);

    const onKeyDownCapture = useCallback((evt: KeyboardEvent) => {
        switch (evt.code) {
            case InteractionKeyCode.ARROW_DOWN:
            case InteractionKeyCode.ARROW_LEFT:
            case InteractionKeyCode.ARROW_RIGHT:
            case InteractionKeyCode.ARROW_UP:
            case InteractionKeyCode.END:
            case InteractionKeyCode.HOME:
            case InteractionKeyCode.PAGE_DOWN:
            case InteractionKeyCode.PAGE_UP:
            case InteractionKeyCode.TAB:
                requestAnimationFrame(() => {
                    focusShift.current = 0;
                    interactionKeyPressed.current = false;
                });
                interactionKeyPressed.current = true;
                break;
        }

        if (evt.code === InteractionKeyCode.TAB) {
            focusShift.current = evt.shiftKey ? -1 : 1;
        }
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
                (current as HTMLElement).removeEventListener('keydown', onKeyDownCapture, true);
                (current as HTMLElement).addEventListener('focusin', onFocusInCapture, true);
                (current as HTMLElement).addEventListener('focusout', onFocusOutCapture, true);
                current.addEventListener('click', onClickCapture, true);
                tabbableRoot.rootElement = current;
            } else tabbableRoot.rootElement = null;
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
